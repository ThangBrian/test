/*

Auto-extracted snapshot of SuspendedPassage and its transitive dependencies.

-----------------------------------------------------------------------------
Generated on: 2026-09-15 
-----------------------------------------------------------------------------

*/

struct SuspendedPassage: Codable {
    
    let conveyances: [SuspendedConveyance]
    
    let travellers: [SuspendedTraveller]
    
    /// BSO API schema CBSAMetadata
    let crossingMetadata: Components.Schemas.CBSAMetadata?
    
    /// BSO API schema CrossingRecommendationDto
    let crossingRecommendation: Components.Schemas.CrossingRecommendationDto?
}

struct SuspendedTraveller: Codable {
    let crossingId: String?
    let entityId: String?
    let travellerGroupings: [TravellerGrouping]?
    /// BSO API schema TravellerAssessmentData
    let assessmentData: Components.Schemas.TravellerAssessmentData?
    let person: Person
    let primaryDocument: Document?
    let memberships: [Membership]?
    /// BSO API schema DeclarationDto
    let declarations: Components.Schemas.DeclarationDto?
    let referrals: [Referral]
    let bioVerificationResult: BioVerificationResult?
    /// RDMS group 909 code
    let bioExemptionReason: String?
    let notes: String?
    
    struct Person: Codable {
        let surname: String
        let givenNames: String?
        /// RDMS group 2615 code
        let citizenship: String
        /// RDMS group 2615 code
        let citizenship2: String?
        /// RDMS group 2615 code
        let residency: String
        /// RDMS group 2641 code
        let gender: String
        let dob: String
        /// RDMS group 2615 code
        let countryOfBirth: String?
        let imageBase64: String?
    }
    
    struct Document: Codable {
        let id: String
        /// RDMS group 2644 code
        let documentType: String
        let documentNumber: String
        let uci: String?
        /// RDMS group 2615 code
        let documentOrigin: String
        let documentExpiry: String?
    }
    
    struct Membership: Codable {
        /// RDMS group 2894 code
        let type: String?
        /// RDMS group 518 code
        let status: String?
        let memberDocuments: [MembershipDocument]?
        let identifiers: [MembershipIdentifier]?
        
        struct MembershipDocument: Codable {
            /// RDMS group 2644 code
            let type: String?
            /// RDMS group 2615 code
            let issuer: String?
            let number: String?
            let expiresOn: String?
            let givenNames: String?
            let surname: String?
        }
        
        struct MembershipIdentifier: Codable {
            /// RDMS group 1938 code
            let type: String?
            let value: String?
        }
    }
    
    struct Referral: Codable {
        let id: String
        /// RDMS group 739 code
        let area: String
        /// RDMS group 687 | 688 code
        let reasons: [String]
        /// RDMS group 512
        let type: String
        /// RDMS group 745 code
        let source: String
        let userId: String?
        let notes: String?
        let referredBy: PrimaryReferralBy
        let overridden: Bool
        /// RDMS group 1254 code
        let overrideReason: String?
    }
    
    enum BioVerificationResult: String, Codable {
        case match
        case noMatch
        case fingerprintVerification
        case noBioReferral
        case excempt
        case queryFailed
        case notAvailable
    }
}

struct TravellerGrouping: Codable {
    let crossingId: String
    let groupId: String
    /// RDMS group 1937 code
    let groupType: String
}

enum PrimaryReferralBy: String, Codable {
    case system
    case officer
}

struct SuspendedConveyance: Codable {
    let crossingId: String?
    let entityId: String?
    let isPrimaryConveyance: Bool
    let tranId: String?
    let travellerGroupings: [TravellerGrouping]?
    let conveyanceMode: String
    let details: ConveyanceDetails
    /// BSO API schema ConveyanceAssessmentData
    let assessmentData: Components.Schemas.ConveyanceAssessmentData?
    
    enum ConveyanceDetails: Codable {
        case highway(LandConveyance)
        case air(AirConveyance)
        case marine(MarineConveyance)
        case rail(RailConveyance)
    }

    struct LandConveyance: Codable {
        /// RDMS group 2698 code
        let conveyanceType: String?
        let licensePlate: String?
        let provinceState: ProvinceState?
        let plateImage: String?
    }

    struct AirConveyance: Codable {
        /// RDMS group 2698 code
        let conveyanceType: String?
        let tailNumber: String?
        let flightNumber: String?
    }

    struct MarineConveyance: Codable {
        /// RDMS group 2698 code
        let conveyanceType: String?
        let vesselName: String?
        let vesselRegistrationNumber: String?
    }

    struct RailConveyance: Codable {
        /// RDMS group 2698 code
        let conveyanceType: String?
        let trainCarrier: String?
        let trainNumber: String?
        let carNumber: String?
    }

    struct ProvinceState: Codable {
        let name: String
        let abbreviation: String
        /// RDMS group 2640 code
        let code: String
        let flag: String
        /// RDMS group 2615 code
        let countryCode: String
        let country: String
    }
}

