import type {
  DocumentEntryType,
  EnforcementAreaCodes,
  PersonalIdentificationType
} from '@main/constants';
import type {
  convertLprV2015PlateReadXmlToJson,
  convertLprV2015NoPlateXmlToJson
} from '../server/sockets/lprSocket/xmlToJsonConverters';
import type {
  MembershipDto,
  PersonAssessmentResultDto,
  TidsDocument,
  TidsMembership,
  TravellerPassageHistory
} from '@main/network/types/bsoSchemas';

export type PassageStatus = 'inProgress' | 'pending' | 'done';
export type DecisionBlocker =
  'OFFICER_REFERRAL' | 'SYSTEM_REFER' | 'BLOCKING_ALERT';

export enum DecisionCode {
  Release = 'RELEASE',
  Refer = 'REFER',
  ReleaseRefer = 'RELEASEREFER'
}

export type IdCategoryType = 'DOCUMENT' | 'MEMBERSHIP' | 'UNKNOWN';

export const DRS_DECISION_MAP: Record<string, DecisionCode> = {
  '002729000001': DecisionCode.Release,
  '002729000002': DecisionCode.Refer,
  '002729000003': DecisionCode.ReleaseRefer
};

export const DECISION_TO_DRS_CODE: Record<DecisionCode, string> = {
  [DecisionCode.Release]: '002729000001',
  [DecisionCode.Refer]: '002729000002',
  [DecisionCode.ReleaseRefer]: '002729000003'
};

export type DecisionName = 'Release' | 'Refer' | 'ReleaseRefer';

export interface Passage {
  id: string;
  passageId?: string;
  status: PassageStatus;
  finalDecision: DecisionCode | null;
  recommendationDecision?: PassageDecision;
  decisionEvaluation?: DecisionEvaluation;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
  conveyances?: Conveyance[];
  travellers?: Traveller[];
  rfidTagsSeen?: string[];
  operationMode: string;
  // Placeholder tranId recorded when a Zone-1 RFID StartRead opens a passage
  // before any traveller or conveyance has arrived. Used by findExistingPassage
  // to bind a later TagRead / LPR plate carrying the same tranId.
  tranId?: string;
  // Furthest lane zone this passage has reached (zone1→1, zone2→2, zone3→3).
  // Drives queue order so Zone-2 transactions sort ahead of Zone-1 ones
  // (TTM-4178). See `compareQueueOrder` in `@shared/passageQueueOrder`.
  zoneRank?: number;
  // TTM-4179: entityIds of the stop-sign RFID traveller(s) the BSO should be warned
  // about — set when an LPR plate event with an off-by-N ("unexpected") tranId attaches
  // here while a plate-less passage sat ahead. Carried on the passage (not a side-channel
  // event) so the renderer shows the warn dialog and suppresses the auto-correction screen
  // in the SAME render the passage arrives. Cleared in the renderer once the BSO answers.
  pendingPlateWarningTravellerIds?: string[] | null;
  domestic: {
    domesticTravellers: number;
    conveyanceType: string;
    goodsFromUs: boolean;
  } | null;
  isReopenedSuspended?: boolean;
  requestedFromSecondary?: boolean;
}

export interface PassageDecision {
  name: DecisionCode;
  code: string;
  receivedAt: string;
}

export interface DecisionEvaluation {
  allowRelease: boolean;
}

export interface ParsedPlateInput {
  entityId: string;
  identityId: string;
  eventType: 'PLATE';
  conveyanceType: string;
  CBSAMetadata: CBSAMetadataType;
  tranId: string;
  numPlates?: number;
  event: string;
  plate: {
    type:
      'PLATEREAD' | 'NOPLATEREAD' | 'NOPLATEFOUND' | 'MANUALPLATE' | 'NOPLATE';
    provState?: string;
    country?: string;
    plateText?: string;
    confidence?: number;
    plateNumber?: number;
    region?: string;
    manualOverride?: boolean;
  };
  source: 'LPR_V2015' | 'LPR_V2024' | 'BSO' | 'SYSTEM';
  imageDetails?: {
    fileName: string;
    content: string;
    width?: number;
    height?: number;
    bottomLeftCoord?: {
      X: number;
      Y: number;
    };
    topRightCoord?: {
      X: number;
      Y: number;
    };
    type: 'patched' | 'full';
  };
  image?: string;
  isDomestic?: boolean;
  primary: boolean;
}

export type RiskAssessmentEntry = {
  score: number;
  description?: string;
  cautions: string[];
  activityType?: string;
  activitySubType?: string;
  status?: string;
};

export type ConveyanceRiskAssessment = {
  summary: RiskAssessmentEntry | null;
  results: RiskAssessmentEntry[];
  hasHotMessageMatch?: boolean;
};
export type RiskErrorType =
  'TIMEOUT' | 'SERVER_ERROR' | 'INVALID_RESPONSE' | 'QUERY_FAILURE';

export type photoVerificationOutcomeType =
  'MATCH' | 'NO_MATCH' | 'INCONCLUSIVE' | 'NO_BIO_REFERRAL';

export interface LprMergeData {
  tranId: string;
  originalTranId: string;
  source: ParsedPlateInput['source'];
  event: string;
  plate: ParsedPlateInput['plate'];
  device?: string;
  zone?: string;
  timestamp?: string;
  mergedAt: string;
}

export interface Conveyance extends ParsedPlateInput {
  lprMerge?: LprMergeData;
  riskAssessment?: ConveyanceRiskAssessment;
  riskAssessmentError?: {
    type: RiskErrorType;
    message: string;
    timestamp: string;
    labelKey?: string;
  };
  initiateRiskAssessment: boolean;
  hasRandomHit: boolean;
  primaryNotes?: string;
  referrals?: EntityReferral[];
  isDomestic: boolean;
  primaryEventSent?: boolean;
}

interface CBSAMetadataType {
  timestamp: string;
  vendor?: {
    name: string;
    version: string;
  };
  site?: {
    siteCode: string;
    laneNum: string;
  };
  device?: string;
  zone?: string;
  laneMode?: string;
  processingZone: string;
  travelMode?: string;
}

export interface ParsedSceneInput {
  CBSAMetadata: CBSAMetadataType;
  conveyanceType?: string;
  event: string;
  eventType: 'scene';
  imageDetails: {
    fileName: string;
    content: string;
    width: number;
    height: number;
    type: 'full';
  };
  numPlates: number;
  source: 'LPR_V2024';
  tranId: string;
}

export type FlattenedV2015PlateRead =
  ReturnType<typeof convertLprV2015PlateReadXmlToJson> extends Promise<infer R>
    ? R
    : never;

export type FlattenedV2015NoPlateRead =
  ReturnType<typeof convertLprV2015NoPlateXmlToJson> extends Promise<infer R>
    ? R
    : never;
export interface PhotoVerificationInput {
  zone: string;
  crossingId: string;
  entityId: string;
  result: string;
  method: string;
}
export interface TrustedTravellerSearchInput {
  program: string;
  wloc?: string;
  kioskId?: string;
  userId?: string;
  phoneNumber?: string;
  membershipId?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
}

export interface ParsedDocumentInput {
  entityId: string;
  identityId: string;
  CBSAMetadata: CBSAMetadataType;
  eventType: 'DOCUMENT';
  tranId?: string;
  event?: string;
  docNumber?: string;
  docNumberCheckDigit?: string;
  surname?: string;
  givenNames?: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  nationality2?: string;
  docType?: PersonalIdentificationType | string;
  docDataType?: DocumentEntryType;
  docName?: string;
  docStatus?: string;
  expiresOn?: string;
  state?: string;
  uniqueClientIdentifier?: string;
  photo?: string;
  issuer?: string | null;
  membershipId?: string;
  residency?: string;
  residencyProvState?: string;
  source: 'DOCUMENT_READER' | 'RFID' | 'BSO';
  phoneNumber?: string;
  passId?: string;
  issuerProvince?: string;
  tagNumber?: string;
  additionalDocuments?: TidsDocument[];
  membershipDetails?: TidsMembership[];
  tidsFailedResponse?: TidsFailedResponse;
  individualId?: string;
  firstLineOptionalData?: string;
  secondLineOptionalData?: string;
  mrz?: {
    mrz1: string;
    mrz2: string;
    mrz3: string;
  };
  isAwaitingRFIDLookup?: boolean;
  IdCategory?: IdCategoryType;
  ImmigrationDocExpired?: boolean;
  membershipCancelled?: boolean;
  nexusNonMember?: boolean;
  memberships?: MembershipDto[]; // This is for the BE - Requested by Andrew P.
}
export type TidsFailedResponse =
  | 'DOCUMENT_FAILURE'
  | 'MEMBERSHIP_FAILURE'
  | 'DOCUMENT_NOT_FOUND'
  | 'MEMBERSHIP_NOT_FOUND'
  | 'QUERY_FAILURE'
  | 'RECORD_NOT_FOUND';

export type PersonalAssessmentFailedResponse = 'ibasFailure' | 'icesFailure';

export const PERSONAL_ASSESSMENT = {
  IBAS: 'ibasFailure' as PersonalAssessmentFailedResponse,
  ICES: 'icesFailure' as PersonalAssessmentFailedResponse
};
export interface Traveller extends ParsedDocumentInput {
  initiateRiskAssessment?: boolean;
  declaration: TravellerDeclaration;
  referrals?: EntityReferral[];
  primaryNotes?: string;
  riskAssessment?: RiskAssessment;
  riskAssessmentError?: {
    type: RiskErrorType;
    message: string;
    timestamp: string;
    labelKey?: string;
  };
  hitsSummary?: HitsSummary;
  passageHistory: LocalTravellerPassageHistory[];
  lookupJobId?: string;
  hasRandomHit?: boolean;
  passageHistoryFetchFailed?: boolean;
  officerReferralSent?: boolean;
  cpid?: string;
  travellerFeatures?: TravellerFeatureValue[];
  mdm?: MdmPerson;
  mdmFetched?: boolean;
}

export interface LocalTravellerPassageHistory extends TravellerPassageHistory {
  id: string;
}

export interface TravellerFeatureValue {
  // 003304 RDM_Gkey the renderer resolves against the codeset.
  id?: string;
  values?: string[];
  generatedOn?: string;
}

// MDM master person record, looked up by cpid. Everything is optional: the
// spec marks no field required, and a record may carry an identity with no
// identifiers or documents.
export interface MdmIdentifier {
  type?: string;
  value?: string;
}

export interface MdmIdentity {
  surname?: string;
  givenNames?: string;
  dateOfBirth?: string;
  citizenship?: string;
  gender?: string;
}

export interface MdmDocument {
  type?: string;
  number?: string;
  countryOfIssuance?: string;
  surname?: string;
  givenNames?: string;
  dateOfBirth?: string;
  gender?: string;
  citizenship?: string;
  birthCountry?: string;
  issuedOn?: string;
  expiresOn?: string;
  inactivatedOn?: string;
}

export interface MdmPerson {
  cpid?: string;
  travelStatus?: string;
  identity?: MdmIdentity;
  identifiers?: MdmIdentifier[];
  documents?: MdmDocument[];
}

export type EnforcementArea = keyof typeof EnforcementAreaCodes;
export type ReferralSource = 'OFFICER' | 'SYSTEM';

export interface ReferralDetails {
  reasons: string[];
  referType?: string;
  readOnly?: boolean;
  areaIdentifier: string;
  sourceIdentifier: string;
}

export interface EntityReferral {
  area: EnforcementArea;
  bySource: Partial<Record<ReferralSource, ReferralDetails>>;
}

export type RiskBannerLevel =
  | 'ARMED_AND_DANGEROUS'
  | 'EXACT_MATCH'
  | 'LSFD_MATCH'
  | 'HIGH_CLOSE_MATCH'
  | 'HOT_MESSAGE_MATCH'
  | 'LOW_CLOSE_MATCH'
  | 'NEUTRAL'
  | 'PHOTO_VERIFICATION_REQUIRED'
  | 'NO_VALID_VISA_ON_FILE'
  | 'NO_CDN_PR_CARD_ON_FILE'
  | 'EXPIRED_CDN_PR_CARD_ON_FILE'
  | 'PHOTO_NO_MATCH'
  | 'BIO_VERIFICATION_REQUIRED'
  | 'FINGERPRINT_VERIFICATION_REQUIRED'
  | 'CANCELLED_MEMBERSHIP'
  | 'OFFICER_REFERRAL'
  | 'TRAVELLER_RANDOM_HIT'
  | null;
export type RiskBannerTone =
  'STRIPED' | 'RED' | 'ORANGE' | 'GRAY' | 'NEUTRAL' | null;

export interface HitsSummary {
  level: RiskBannerLevel;
  tone: RiskBannerTone;
  labelKey: string | undefined;
  stats: {
    highestScore: number | null;
    totalHits: number;
    timeouts: number;
    failures: number;
    noHit: boolean;
  };
  hasHotMessageMatch?: boolean;
}

export interface NormalizedImmDocument {
  type?: string;
  subType?: string;
  visaEntryType?: string;
  issuedOn?: string;
  expiresOn?: string;
  docNumber?: string;
}

export type RiskAssessment = {
  personAssessment: {
    customs: {
      summary: RiskAssessmentSummary | null;
      items: RiskSummaryItem[];
    };
    immigration: {
      summary: RiskAssessmentSummary | null;
      items: RiskSummaryItem[];
    };
    riskResult: PersonAssessmentResultDto[];
    personalAssessmentFailure: PersonalAssessmentFailedResponse[];
  };
  compliance: {
    showSuccessIndicator: boolean;
    showNotAvailable: boolean;
    showFailed: boolean;
    showNotAssessed: boolean;
  };
  lsfdAssessment: LSFDAEvaluation | null;
  immigrationDocuments?: ImmEvaluation | null;
  trbpResults?: TRBPEvaluation;
  hasHotMessageMatch?: boolean;
};

type RiskAssessmentSummary = {
  hits: number;
  highestScore: number | null;
  provider: string | null;
  activityType: string | null;
  activitySubType: string | null;
  cautions: string[] | null;
};

export type RiskSummaryItem = {
  id: string;
  score?: number;
  enforcementArea?: string;
  activityType?: string;
  activitySubType?: string;
  provider?: string;
  cautions?: string[];
  status?: string;
  surname?: string;
  givenNames?: string;
  gender?: string;
  citizenship?: string;
  dob?: string;
  armedAndDangerous: boolean;
  activityNumber?: string;
  dataSource?: string;
};

export interface LSFDANormalizedResult {
  issuingOrg?: string;
  reportingAgency?: string;
  reportingReason?: string;
  reportingDate?: string;
}

export interface LSFDAEvaluation {
  querySuccessful: boolean;
  results: LSFDANormalizedResult[];
  hasExactMatch: boolean;
}

export interface TRBPEvaluation {
  isPhotoVerificationRequired: boolean;
  isBioVerificationRequired: boolean;
  isNoBioReferral?: boolean;
  querySuccessful: boolean;
  queryExecuted: boolean;
  isPhotoAvailable: boolean;
  isTRBPExempt: boolean;
  photoVerificationOutcome?: photoVerificationOutcomeType | undefined;
  results: TRBPNormalizedResult | null;
  decision?: string;
}

export interface TRBPNormalizedResult {
  givenName?: string;
  surname?: string;
  birthDate?: string;
  gender?: string;
  controlDocumentNumber?: string[];
  country?: string;
  city?: string;
  citizenship?: string;
  bioPhoto?: string;
  fpIndicator?: boolean;
  biometricExemptionReason?: string;
}

export interface ImmEvaluation {
  querySuccessful: boolean;
  uci?: string;
  visaStatus?: string;
  hasPermit?: boolean;
  documents: NormalizedImmDocument[];
}

export type AnswerByQuestionIdItem = {
  questionId: number;
  choiceId: number;
  data?: string;
};

export interface TravellerDeclaration {
  residency?: string;
  durationOfAbsence?: string;
  purposeOfTrip?: string;
  durationOfStay?: number;
  answersByQuestionId?: AnswerByQuestionIdItem[];
}
