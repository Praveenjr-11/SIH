"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface OfficerProfile {
  name: string;
  title: string;
  role: string;
  district: string;
  taluk: string;
  email: string;
  phone: string;
  badgeNo: string;
  department: string;
}

export const PRESET_OFFICERS: OfficerProfile[] = [
  {
    name: "Thiru K. Muthusamy, IAS",
    title: "District Collector & District Magistrate",
    role: "DISTRICT_COLLECTOR",
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    email: "collr.kanchipuram@tn.gov.in",
    phone: "044-27237433",
    badgeNo: "TN-IAS-2012-042",
    department: "District Revenue Administration"
  },
  {
    name: "Tmt. S. Rajeshwari, DRO",
    title: "District Revenue Officer (DRO)",
    role: "DRO",
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    email: "dro.kanchipuram@tn.gov.in",
    phone: "044-27237300",
    badgeNo: "TN-DRO-2015-108",
    department: "Revenue & Disaster Management Department"
  },
  {
    name: "Thiru P. Ramanathan, RDO",
    title: "Revenue Divisional Officer (RDO)",
    role: "RDO",
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    email: "rdo.sriperumbudur@tn.gov.in",
    phone: "044-27426492",
    badgeNo: "TN-RDO-2018-074",
    department: "Revenue Divisional Administration"
  },
  {
    name: "Thiru V. Selvam, Tahsildar",
    title: "Taluk Tahsildar",
    role: "TAHSILDAR",
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    email: "tahsildar.sriperumbudur@tn.gov.in",
    phone: "044-25388978",
    badgeNo: "TN-TAH-2020-312",
    department: "Taluk Revenue Office"
  },
  {
    name: "Er. M. Gunasekar",
    title: "Assistant Director of Survey & Land Records",
    role: "AD_SURVEY",
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    email: "ad.survey.kanchi@tn.gov.in",
    phone: "044-25228025",
    badgeNo: "TN-SURV-2017-089",
    department: "Department of Survey and Land Records"
  },
  {
    name: "Er. R. Anitha",
    title: "Senior Town Planning Officer (DTCP / CMDA)",
    role: "TOWN_PLANNER",
    district: "Kanchipuram",
    taluk: "Sriperumbudur",
    email: "dtcp.kanchipuram@tn.gov.in",
    phone: "044-28414800",
    badgeNo: "TN-DTCP-2019-204",
    department: "Directorate of Town and Country Planning"
  }
];

interface OfficerAuthContextType {
  officer: OfficerProfile | null;
  loginOfficer: (profile: OfficerProfile) => void;
  logoutOfficer: () => void;
}

const OfficerAuthContext = createContext<OfficerAuthContextType>({
  officer: null,
  loginOfficer: () => {},
  logoutOfficer: () => {}
});

export function OfficerAuthProvider({ children }: { children: React.ReactNode }) {
  const [officer, setOfficer] = useState<OfficerProfile | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("landstack_officer_session");
      if (saved) {
        setOfficer(JSON.parse(saved));
      } else {
        // Default to District Collector profile for smooth testing experience
        setOfficer(PRESET_OFFICERS[0]);
      }
    } catch {
      setOfficer(PRESET_OFFICERS[0]);
    }
  }, []);

  const loginOfficer = (profile: OfficerProfile) => {
    setOfficer(profile);
    try {
      localStorage.setItem("landstack_officer_session", JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save officer session", e);
    }
  };

  const logoutOfficer = () => {
    setOfficer(null);
    try {
      localStorage.removeItem("landstack_officer_session");
    } catch (e) {
      console.error("Failed to clear officer session", e);
    }
  };

  return (
    <OfficerAuthContext.Provider value={{ officer, loginOfficer, logoutOfficer }}>
      {children}
    </OfficerAuthContext.Provider>
  );
}

export function useOfficerAuth() {
  return useContext(OfficerAuthContext);
}
