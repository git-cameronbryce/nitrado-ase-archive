interface Entries {
  data: {
    entries: {
      type: string;
      path: string;
      name: string;
      size: number;
      created_at: number;
      modified_at: number;
      accessed_at: number;
    }[];
  };
}

export type { Entries };
