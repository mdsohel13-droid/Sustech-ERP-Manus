export const PRODUCTS_WITH_SPECS: Record<number, any> = {
  1: {
    id: 1,
    name: "Atomberg Gorilla Fan",
    category: "fan",
    description: "High-performance ceiling fan with smart controls",
    specs: {
      power: "60W",
      warranty: "2 years",
      features: ["Whisper quiet", "Energy efficient", "Smart remote"]
    }
  },
  2: {
    id: 2,
    name: "Growatt ESS (Small)",
    category: "ess",
    description: "Compact energy storage system for residential use",
    specs: {
      capacity: "5kWh",
      power: "3kW",
      warranty: "10 years",
      features: ["Lithium battery", "Smart monitoring", "Backup power"]
    }
  },
  3: {
    id: 3,
    name: "Growatt ESS (Commercial)",
    category: "ess",
    description: "Large-scale energy storage for commercial applications",
    specs: {
      capacity: "50kWh",
      power: "30kW",
      warranty: "10 years",
      features: ["Scalable", "High efficiency", "Remote monitoring"]
    }
  },
  4: {
    id: 4,
    name: "Jinko Solar PV Panel",
    category: "solar_pv",
    description: "High-efficiency monocrystalline solar panels",
    specs: {
      power: "550W",
      efficiency: "22.5%",
      warranty: "25 years",
      features: ["High efficiency", "Durable", "Weather resistant"]
    }
  },
  5: {
    id: 5,
    name: "JA Solar PV Panel",
    category: "solar_pv",
    description: "Premium solar panels with advanced technology",
    specs: {
      power: "500W",
      efficiency: "21.8%",
      warranty: "25 years",
      features: ["Bifacial design", "High output", "Long lifespan"]
    }
  },
  6: {
    id: 6,
    name: "EPC Solar Project",
    category: "epc_project",
    description: "Full engineering, procurement, and construction service",
    specs: {
      scalable: "Yes",
      timeline: "3-6 months",
      warranty: "5 years",
      features: ["Complete solution", "Professional installation", "Performance guarantee"]
    }
  },
  7: {
    id: 7,
    name: "Installation Work",
    category: "installation",
    description: "Professional installation services for solar and energy systems",
    specs: {
      scalable: "Yes",
      warranty: "1 year",
      timeline: "Varies",
      features: ["Expert technicians", "Quality assurance", "Post-installation support"]
    }
  }
};

export function getProductById(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  return PRODUCTS_WITH_SPECS[numId] || null;
}
