// export type contractNode = {
//     contractId: string,
//     title: string,
//     description: string,
//     region: string,
//     publishedDate: string,
//     startDate: string,
//     endDate: string,
//     awardedDate: string,
//     awardedValue: number,
//     isSubContract: boolean,
//     isSuitableForSme: boolean,
//     isSuitableForVco: boolean,
//     issuedByParties: Array<string>,
//     category: string
// }

// export type contractAwardedToNode = {
//     contractId: string,
//     organisationName: string,
//     contactName: string,
//     contactEmail: string,
//     contactAddress: string,
//     contactTown: string,
//     contactPostcode: string,
//     contactCountry: string,
//     contactPhone: string,
//     contactWebsite: string,
// }

export type recievedContractRelationship = {
    awardedDate: string,
}

export type issuedContractRelationship = {
    awardedDate: string,
}

export type contractNode = {    
    id: string,
    title: string,
    supplier: string,
    description: string,    
    publishedDate: string,    
    awardedDate: string,
    awardedValue: number,    
    issuedByParties: Array<string>,
    categories: Array<string>,
    industry: string,
    link: string,
    location: string,
    originalIndustry: string
}

export type contractAwardedToNode = {
    name: string|undefined,    
}

export type dynamoItem = {
    id: string,
    title: string,
    supplier: string,
    description: string,    
    publishedDate: string,    
    awardedDate: string,
    awardedValue: number,    
    issuedByParties: Set<string>,
    category: string,
    industry: string,
    link: string,
    location: string,
    awardedTo: string
}
