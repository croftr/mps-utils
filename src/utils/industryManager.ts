
export const normalizeIndustry = (rawIndustry: string): string => {

    if (!rawIndustry) return "unidentifiable";

    const lastHyphenIndex = rawIndustry.lastIndexOf("-"); // Find the last hyphen's index
    const normalizedIndustry = lastHyphenIndex !== -1
        ? rawIndustry.substring(0, lastHyphenIndex).trim()  // Remove everything after the last hyphen
        : rawIndustry; // If no hyphen, keep the original string
    const industry = normalizedIndustry.trim().toLowerCase();
    const itKeywords = [
        "it", "software", "computer", "data", "technical", "internet", "network", "hardware", "electronic",
        "telecommunications", "system", "technology", "digital", "programming", "web", "cloud", "cybersecurity", "servers", "fibre-optic"
    ];
    const constructionKeywords = [
        "construction", "engineering", "building", "architectural", "refurbishment", "works", "installation", "concrete", "surfacing work", "painting", "landscaping ", "roof", "insulation",
        "infrastructure", "civil", "mechanical", "structural", "renovation", "maintenance", "repair", "excavating", "metalwork", "joinery", "tipper", "Decoration", "glazing", "ironmongery",
        "scaffolding", "masonry", "brick", "skip", "hoists", "fencing", "plastering", "floor-laying", "landscape", "floor", "flooring", "plumbing", "decorating"
    ];
    const healthKeywords = [
        "health", "social work", "medical", "healthcare", "hospital", "clinic", "pharmaceutical", "therapy", "wellness", "counselling", "pharmacy", "vaccine", "vaccines", "dental", "dentist", "psychiatrist",
        "psychologist", "ambulance", "orthopaedic", "laboratory"
    ];
    const researchKeywords = [
        "development", "research", "innovation", "laboratory", "scientific", "experiment", "study", "analysis", "investigation"
    ];
    const consultingKeywords = [
        "consult", "advisory", "consulting", "advice", "guidance", "strategy", "planning", "management"
    ];
    const animalKeywords = [
        "dog", "horse", "animal", "veterinary", "pet", "livestock", "agriculture", "farming"
    ];
    const trainingKeywords = [
        "training", "education", "learning", "development", "coaching", "instruction", "workshop", "seminar"
    ];
    const transportKeywords = [
        "aviation", "airport", "train", "car", "transport", "vehicle", "automotive", "railway", "air-charter", "traffic",
        "shipping", "maritime", "logistics", "freight", "trucking", "haulage", "delivery", "transit", "marine", "ship", "ships",
        "transportation", "mobility", "shipping", "airline", "bus", "taxi", "ride-sharing", "vans", "signage", "highway", "helicopters", "parking", "trucks", "truck",
        "road", "roads", "roundabouts", "roundabout"
    ];
    const electricalKeywords = [
        "electric", "lighting", "electrical", "electronics", "power", "energy", "wiring", "circuit", "appliance",
        "generator", "transformer", "cable", "battery", "switchgear", "electronics", "scanners", "television",
        "radio", "receivers", "video", "electricity", "power grid", "renewable energy", "solar", "wind", "audio", "robot", "robots"
    ];
    const retailKeywords = ["retail", "clothing", "footwear", "luggage", "accessories", "fashion"];
    const hospitalityKeywords = ["food", "beverages", "tobacco", "restaurant", "hotel", "catering", "pub", "eating", "drink", "ice cream", "school meals", "cafeteria", "pastry",
        "bread", "cake", "coffee", "tea", "meat", "entertainment"];
    const agricultureKeywords = ["agricultural", "forestry", "horticultural", "aquacultural", "apicultural", "farming", "tractors", "dairy"];
    const printingKeywords = ["print", "photocopiers", "newspapers", "newspaper", "journals", "magazines", "magasines", "periodicals", "book", "library", "photographs", "photo"];
    const foreignKeywords = ["foreign", "foreign-affairs", "international", "embassy", "consulate", "diplomacy", "trade agreement", "global", "tractor"];
    const staffingKeywords = ["staff", "personnel", "recruitment", "temporary", "employment agency"];
    const legalKeywords = ["law", "court", "courts", "temporary", "employment agency", "justice", "judicial", "prison"];
    const housingKeywords = ["housing", "surveying", "renting", "rent", "leasing", "real estate", "accommodation", "residential", "house", "survey"];
    const translationKeywords = ["translation", "Interpretation"];
    const postKeywords = ["post", "postal", "courier", "mailing", "mail"];
    const socialServicesKeywords = ["welfare", "children", "playground", "social"];
    const sportsKeywords = ["sports", "recreation", "leisure", "fitness", "gym", "athletic", "exercise", "recreational", "sport", "culture", "bicycles", "cultural", "sporting", "recreational", "games", "toys", "artistic", "art"];
    const furnishingKeywords = ["furnished", "furniture", "furnishings", "interior design"];
    const cleaningKeywords = ["cleaning", "sanitation", "hygiene", "janitorial", "clean"];
    const securityKeywords = ["defence", "safety", "security", "fire doors", "firefighting", "surveillance", "fire", "extinguishers", "protective", "protective", "protection", "alarm", "speed camera"];
    const wasteKeywords = ["weed", "weed-clearance", "chemical", "pest", "pest-control", "pollution", "decontamination", "refuse", "waste",
        "asbestos", "disposal", "hazardous", "recycling", "drainage",
        "disposal", "rubbish", "bins", "incinerators", "toxic", "radioactive", "sewage", "contaminated", "cesspool", "septic tank"]
    const machineryKeywords = ["sensors", "equipment", "ventilation", "camera", "cameras", "phone", "pumps", "x-ray", "photographic", "spectrometer", "microscope", "armour plating", "instruments", "spray booths", "machine", "apparatus", "laboratory", "mowers", "spectrometers", "analysers", "centrifuges", "heating equipment", "navigational", "spotlights", "appliances", "generators"];
    const financeKeywords = ["economic", "bank", "banking", "financial", "finance", "insurance", "pensions", "pension", "treasury", "investment", "accounting"];
    const energyKeywords = ["oil", "gas", "solar", "wind", "tidal", "gas"];
    const advertisingKeywords = ["advertising ", "marketing"];
    const officeKeywords = ["office", "chair", "desk", "stationery"];

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
    ];


    for (const { keywords, category } of keywordCategories) {
        const pluralKeywords = keywords.map(keyword => keyword + 's'); // Add plural forms
        const allKeywords = [...keywords, ...pluralKeywords];

        if (allKeywords.some((keyword) => new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`).test(industry))) {
            return category;
        }
    }

    return industry || "other"

};