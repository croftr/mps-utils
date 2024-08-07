export type MembershipStatus = {
  statusIsActive: string;
}

export type LatestHouseMembership = {
  membershipFrom: string;
  membershipFromId: number;
  house: number;
  membershipStartDate: string;
  membershipEndDate: string;
  status: string;
  membershipStatus: MembershipStatus;  
}

export type Mp = {
  gender: string;
  id: number;
  nameListAs: string;
  nameDisplayAs: string;
  nameFullTitle: string;
  nameAddressAs: string;
  latestParty: Party;
  latestHouseMembership: LatestHouseMembership;
}

export type Party = {
  id: number;
  name: string;
  abbreviation: string;
  backgroundColour: string;
  foregroundColour: string;
  isLordsMainParty: boolean;
  isLordsSpiritualParty: boolean;
  governmentType: null | "government";
  isIndependentParty: boolean;
}

export type responseWrapper = {
  items: Array<responseValue>;
}

export type responseValue = {
  value: Mp;
}

export type MPMessage = {
  id: number,
  name: string
}