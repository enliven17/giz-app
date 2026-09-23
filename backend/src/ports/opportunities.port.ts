export type Opportunity = {
  id: string;
  name: string;
  status: string;
  apr: number;
  totalApr: number;
  tvl: number;
  chainId: number;
  chain: {
    id: number;
    name: string;
  };
  protocol: {
    id: string;
    name: string;
  };
};

export type TvlRecord = {
  total: number;
};

export type ListOpportunitiesQuery = {
  search: string;
  page: number;
  items: number;
  chainId: number;
};

export type OpportunityPage = {
  list: Opportunity[];
  total: number;
};

export type TvlRecordsQuery = {
  id: string;
  items: number;
};

export interface Opportunities {
  list(query: ListOpportunitiesQuery): Promise<OpportunityPage>;
  tvlRecords(query: TvlRecordsQuery): Promise<TvlRecord[]>;
}
