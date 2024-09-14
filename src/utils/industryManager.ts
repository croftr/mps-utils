
const itKeywords = [
    "it", "software", "computer", "data", "technical", "internet", "network", "hardware", "electronic", "computers", "database", "helpdesk",
    "telecommunications", "system", "technology", "digital", "programming", "web", "cloud", "cybersecurity", "servers", "fibre-optic"
];
const constructionKeywords = [
    "construction", "engineering", "building", "architectural", "refurbishment", "works", "installation", "concrete", "surfacing work", "painting", "landscaping ", "roof", "insulation", "metalworking", "doors",
    "infrastructure", "civil", "mechanical", "structural", "renovation", "maintenance", "repair", "excavating", "metalwork", "joinery", "tipper", "decoration", "glazing", "ironmongery", "fences", "windows",
    "scaffolding", "masonry", "brick", "skip", "hoists", "fencing", "plastering", "floor-laying", "landscape", "floor", "flooring", "plumbing", "decorating", "window", "door", "roofing", "demolition", "tarmac", "installations"
];
const healthKeywords = [
    "health", "social work", "medical", "healthcare", "hospital", "clinic", "pharmaceutical", "therapy", "wellness", "counselling", "pharmacy", "vaccine", "vaccines", "dental", "dentist", "psychiatrist", "diagnostic", "incubator", "incubators",
    "psychologist", "ambulance", "orthopaedic", "laboratory", "paramedical", "paramedic", "physiotherapy", "surgical", "vitamin", "sandwiches", "sandwich", "x-ray", "cardiac", "incubator", "clinical", "pathology", "endoscopy"
];
const researchKeywords = [
    "development", "research", "innovation", "laboratory", "scientific", "experiment", "study", "analysis", "investigation", "microscope", "microscopes"
];
const consultingKeywords = [
    "consult", "advisory", "consulting", "advice", "guidance", "strategy", "planning", "management", "consultancy"
];
const animalKeywords = [
    "dog", "horse", "animal", "veterinary", "pet", "livestock", "agriculture", "farming"
];
const trainingKeywords = [
    "training", "education", "learning", "development", "coaching", "instruction", "workshop", "seminar", "school", "textbooks"
];
const transportKeywords = [
    "aviation", "airport", "train", "car", "transport", "vehicle", "automotive", "railway", "air-charter", "traffic", "highways", "cars", "travel",
    "shipping", "maritime", "logistics", "freight", "trucking", "haulage", "delivery", "transit", "marine", "ship", "ships", "minibuses", "trailers",
    "transportation", "mobility", "shipping", "airline", "bus", "taxi", "ride-sharing", "vans", "signage", "highway", "helicopters", "parking", "trucks", "truck",
    "road", "roads", "roundabouts", "roundabout", "bus", "coach", "trailer", "aircraft", "vehicle", "vehicles", "drive", "buses", "coaches", "driver", "signalling"
];
const electricalKeywords = [
    "electric", "lighting", "electrical", "electronics", "power", "energy", "wiring", "circuit", "appliance", "simulators", "laser", "lasers",
    "generator", "transformer", "cable", "battery", "switchgear", "electronics", "scanners", "television", "lamps", "light",
    "radio", "receivers", "video", "electricity", "power grid", "renewable energy", "solar", "audio", "robot", "robots", "chargers", "amplifiers"
];
const retailKeywords = ["retail", "clothing", "footwear", "luggage", "accessories", "fashion"];
const hospitalityKeywords = ["food", "beverages", "tobacco", "restaurant", "hotel", "catering", "pub", "eating", "drink", "ice cream", "school meals", "cafeteria", "pastry", "vending",
    "bread", "cake", "coffee", "tea", "meat", "entertainment", "exhibition", "fruit", "event", "floral"];
const agricultureKeywords = ["agricultural", "forestry", "horticultural", "aquacultural", "apicultural", "farming", "tractors", "dairy", "trees", "forest", "plant"];
const printingKeywords = ["print", "photocopier", "paper", "newspapers", "newspaper", "journals", "magazines", "magasines", "periodicals", "book", "library", "photographs", "photo", "printed", "printers", "printing", 
    "publications", "textbook", "photocopiers", "publishing", "publish"];
const foreignKeywords = ["language", "foreign", "foreign-affairs", "international", "embassy", "consulate", "diplomacy", "trade agreement", "global", "tractor"];
const staffingKeywords = ["staff", "personnel", "recruitment", "temporary", "employment agency", "vetting", "interview", "performance"];
const legalKeywords = ["law", "court", "courts", "temporary", "employment agency", "justice", "judicial", "prison", "crime", "rehabilitation", "police", "legal", "probation", "bailiff"];
const housingKeywords = ["housing", "surveying", "renting", "rent", "leasing", "real estate", "accommodation", "residential", "house", "survey", "buildings", "building"];
const translationKeywords = ["translation", "interpretation"];
const postKeywords = ["post", "postal", "courier", "mailing", "mail", "postage-franking"];
const socialServicesKeywords = ["welfare", "children", "playground", "social", "benefit", "benefits", "community"];
const sportsKeywords = ["sportswear", "sports", "recreation", "leisure", "fitness", "gym", "athletic", "exercise", "recreational", "sport", "culture", "bicycles", "cultural", "sporting", "recreational", "games", "toys", "artistic", "art", "graphic", "design"];
const furnishingKeywords = ["furnished", "furniture", "furnishings", "interior design"];
const cleaningKeywords = ["cleaning", "sanitation", "hygiene", "janitorial", "clean", "extraction", "ventalation", "laundry", "wash", "washing"];
const securityKeywords = ["defence", "safety", "security", "fire doors", "firefighting", "surveillance", "fire", "extinguishers", "protective", "protective", "protection", "alarm", "speed camera", "fraud", "guard", "weapons"];
const wasteKeywords = ["weed", "weed-clearance", "chemical", "pest", "pest-control", "pollution", "decontamination", "refuse", "waste",
    "asbestos", "disposal", "hazardous", "recycling", "drainage", "water-treatment",
    "disposal", "rubbish", "bins", "incinerators", "toxic", "radioactive", "sewage", "contaminated", "cesspool", "septic tank"]
const machineryKeywords = ["sensors", "equipment", "ventilation", "camera", "cameras", "pumps", "x-ray", "photographic", "spectrometer", "freezers", "microscope", "armour plating", "instruments", "spray booths", "machine", "machinery", "apparatus", "laboratory", "mowers", "spectrometers", "analysers", "centrifuges", "heating equipment", "navigational", "spotlights", "appliances", "generators"];
const financeKeywords = ["economic", "bank", "banking", "financial", "finance", "insurance", "pensions", "pension", "treasury", "investment", "accounting", "auditing", "audit" ];
const energyKeywords = ["oil", "gas", "solar", "wind", "tidal", "gas", "energy", "petroleum", "fuel", "electricity", "gas", "fuels", "fuel", "petrol", "oils", "gases"];
const advertisingKeywords = ["advertising ", "marketing", "public relations"];
const officeKeywords = ["office", "chair", "desk", "stationery", "monitor"];
const telecommunicationsKeywords = ["telephone", "phone", "wireless", "internet", "wifi", "wi-fi", "internet", "isp", "satellite", "cable", "wireless", "television", "broadband", "network", "satellite",
    "call center", "call centre", "router", "data center", "switches", "telecommunication", "5g", "4g", "3g", "iot", "sms", "telephone-answering", "telephones", "networks"]

const keywordCategories = [
    { keywords: itKeywords, category: "IT and Technology" },
    { keywords: healthKeywords, category: "Health and Social Care" },
    { keywords: electricalKeywords, category: "Electrical and Electronics" },
    { keywords: researchKeywords, category: "Research and Development" },
    { keywords: transportKeywords, category: "Transport" },
    { keywords: agricultureKeywords, category: "Agriculture" },
    { keywords: hospitalityKeywords, category: "Hospitality" },
    { keywords: advertisingKeywords, category: "Advertising and Marketing" },
    { keywords: retailKeywords, category: "Retail" },
    { keywords: staffingKeywords, category: "Staffing and Recruitment" },
    { keywords: foreignKeywords, category: "Foreign Affairs" },
    { keywords: furnishingKeywords, category: "Furnishing" },
    { keywords: financeKeywords, category: "Finance" },
    { keywords: energyKeywords, category: "Energy" },
    { keywords: consultingKeywords, category: "Consultancy" },
    { keywords: trainingKeywords, category: "Training" },
    { keywords: constructionKeywords, category: "Construction and Engineering" },
    { keywords: securityKeywords, category: "Safety and Security" },
    { keywords: wasteKeywords, category: "Waste Management" },
    { keywords: cleaningKeywords, category: "Cleaning" },
    { keywords: printingKeywords, category: "Print Media" },
    { keywords: legalKeywords, category: "Legal" },
    { keywords: housingKeywords, category: "Housing" },
    { keywords: translationKeywords, category: "Translation" },
    { keywords: postKeywords, category: "Postal and Courier Services" },
    { keywords: socialServicesKeywords, category: "Social Services" },
    { keywords: sportsKeywords, category: "Sports and Recreation" },
    { keywords: officeKeywords, category: "Office supplies" },
    { keywords: animalKeywords, category: "Animals" },
    { keywords: machineryKeywords, category: "Machinery and Equipment" },
    { keywords: telecommunicationsKeywords, category: "Telecommunications" },
];

export const normalizeIndustry = (rawIndustry: string): string[] => {
    

    if (!rawIndustry) return ["unidentifiable"];
  
    const lastHyphenIndex = rawIndustry.lastIndexOf("-");
    
    // Only trim the part before the last hyphen, if it exists
    const normalizedIndustry = lastHyphenIndex !== -1
      ? rawIndustry.substring(0, lastHyphenIndex).trim() 
      : rawIndustry;
    
    const industry = normalizedIndustry.toLowerCase(); 

    const matchedCategories = [];

    for (const { keywords, category } of keywordCategories) {
        if (keywords.some((keyword) => new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`).test(industry))) {
            matchedCategories.push(category);
        }
    }
    
    if (matchedCategories.length > 0) {
        return matchedCategories
    } else {
        const industryWithSpaces = industry.replace(/\d/g, ''); // Replace digits with a space
        return [industryWithSpaces];
    }
    
};