import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface TngisClientConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitMs?: number;
}

export class TngisClient {
  private client: AxiosInstance;
  private maxRetries: number;
  private rateLimitMs: number;
  private lastRequestTime: number = 0;

  constructor(config?: TngisClientConfig) {
    this.maxRetries = config?.maxRetries || 3;
    this.rateLimitMs = config?.rateLimitMs || 1000;
    this.client = axios.create({
      baseURL: config?.baseUrl || process.env.TNGIS_BASE_URL || 'https://tngis.tn.gov.in',
      timeout: config?.timeout || parseInt(process.env.TNGIS_REQUEST_TIMEOUT || '30000', 10),
      headers: {
        'User-Agent': 'LandStack/1.0',
        'Accept': 'application/json, text/plain, */*'
      }
    });
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  private async executeWithRetry<T>(requestFn: () => Promise<T>, endpoint: string): Promise<T> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < this.maxRetries) {
      try {
        await this.enforceRateLimit();
        const startTime = Date.now();
        const response = await requestFn();
        const duration = Date.now() - startTime;
        
        console.log(`[TNGIS Client] SUCCESS ${endpoint} (${duration}ms)`);
        // We could also log to gis_ingestion_log here if we want database-level logging.
        
        return response;
      } catch (err: any) {
        attempt++;
        lastError = err;
        
        const status = err.response?.status;
        console.warn(`[TNGIS Client] FAILED ${endpoint} (Attempt ${attempt}/${this.maxRetries}) - Status: ${status}`);

        // If authorization required, fail immediately per instructions
        if (status === 401 || status === 403) {
          console.error(`[TNGIS Client] AUTHORIZATION REQUIRED for ${endpoint}. Stopping retry.`);
          throw err;
        }

        if (attempt >= this.maxRetries) {
          console.error(`[TNGIS Client] MAX RETRIES REACHED for ${endpoint}.`);
          throw err;
        }

        // Exponential backoff
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`[TNGIS Client] Waiting ${backoffMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    throw lastError;
  }

  async get<T>(endpoint: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.client.get<T>(endpoint, { params, ...config });
      return response.data;
    }, endpoint);
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await this.client.post<T>(endpoint, data, config);
      return response.data;
    }, endpoint);
  }
}

export const defaultTngisClient = new TngisClient();
