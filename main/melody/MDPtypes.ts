export type MDPJson = {
  _keys: { _rank: number; _length: number; $$proto: "Key" }[];
  _tempoIndex: number;
  _ledFlag: boolean;
  _report: {
    _grade: string;
    _class: string;
    _number: string;
    _name: string;
    _comment: string;
    $$proto: "ReportModule";
  };
  $$proto: "MelodyModule";
};

export type MDPFastXMLParsed = {
  "?xml": {
    "@_version": "1.0";
    "@_encoding": "utf-16";
  };
  MelodyModule: {
    Keys: {
      Key: {
        Rank: string;
        Length: string;
      }[];
    };
    tempoIndex: number;
    ledFlag: boolean;
    Report: {
      Grade: string;
      Class: string;
      Number: string;
      Name: string;
      Comment: string;
    };
    "@_xmlns:xsd": "http://www.w3.org/2001/XMLSchema";
    "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance";
  };
};

export interface MDPConvertSettings {
  grade?: string;
  class?: string;
  number?: string;
  name?: string;
  comment?: string;
}
