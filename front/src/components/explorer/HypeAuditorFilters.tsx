import { Slider } from "@/components/ui/slider";

// 🎯 INTERFACES PARA FILTROS DE HYPEAUDITOR DISCOVERY
interface AudienceGenderFilter {
  gender: 'male' | 'female' | 'any';
  percentage: number;
}

interface AudienceAgeFilter {
  minAge: number;
  maxAge: number;
  percentage: number;
}

interface AudienceGeoFilter {
  countries: string[];
  cities: string[];
}

interface HypeAuditorFiltersProps {
  audienceGender: AudienceGenderFilter;
  setAudienceGender: (filter: AudienceGenderFilter) => void;
  audienceAge: AudienceAgeFilter;
  setAudienceAge: (filter: AudienceAgeFilter) => void;
  audienceGeo: AudienceGeoFilter;
  setAudienceGeo: (filter: AudienceGeoFilter) => void;
  accountType: 'brand' | 'human' | 'any';
  setAccountType: (type: 'brand' | 'human' | 'any') => void;
  verified: boolean | null;
  setVerified: (verified: boolean | null) => void;
  hasContacts: boolean | null;
  setHasContacts: (hasContacts: boolean | null) => void;
  hasLaunchedAdvertising: boolean | null;
  setHasLaunchedAdvertising: (hasAdvertising: boolean | null) => void;
  aqsRange: { min: number; max: number };
  setAqsRange: (range: { min: number; max: number }) => void;
  cqsRange: { min: number; max: number };
  setCqsRange: (range: { min: number; max: number }) => void;
}

export default function HypeAuditorFilters(props: HypeAuditorFiltersProps) {
  const {
    audienceGender,
    setAudienceGender,
    audienceAge,
    setAudienceAge,
    audienceGeo,
    setAudienceGeo,
    accountType,
    setAccountType,
    verified,
    setVerified,
    hasContacts,
    setHasContacts,
    hasLaunchedAdvertising,
    setHasLaunchedAdvertising,
    aqsRange,
    setAqsRange,
    cqsRange,
    setCqsRange,
  } = props;

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700">Filtros de Audiencia (HypeAuditor)</h3>
      
      {/* Audience Gender */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Audience Gender</label>
        <div className="space-y-3">
          {/* Gender Selection */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="any"
                checked={audienceGender.gender === 'any'}
                onChange={(e) => setAudienceGender({...audienceGender, gender: e.target.value as 'any'})}
                className="text-blue-600"
              />
              <span className="text-sm">Any</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={audienceGender.gender === 'male'}
                onChange={(e) => setAudienceGender({...audienceGender, gender: e.target.value as 'male'})}
                className="text-blue-600"
              />
              <span className="text-sm">Male</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={audienceGender.gender === 'female'}
                onChange={(e) => setAudienceGender({...audienceGender, gender: e.target.value as 'female'})}
                className="text-blue-600"
              />
              <span className="text-sm">Female</span>
            </label>
          </div>
          
          {/* Percentage Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>More than {audienceGender.percentage}% of audience</span>
            </div>
            <Slider
              value={[audienceGender.percentage]}
              onValueChange={(value) => setAudienceGender({...audienceGender, percentage: value[0]})}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Audience Age */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Audience Age</label>
        <div className="space-y-3">
          {/* Age Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{audienceAge.minAge}</span>
              <span>{audienceAge.maxAge}</span>
            </div>
            <Slider
              value={[audienceAge.minAge, audienceAge.maxAge]}
              onValueChange={(value) => setAudienceAge({...audienceAge, minAge: value[0], maxAge: value[1]})}
              max={65}
              min={13}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Percentage Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>More than {audienceAge.percentage}% of audience</span>
            </div>
            <Slider
              value={[audienceAge.percentage]}
              onValueChange={(value) => setAudienceAge({...audienceAge, percentage: value[0]})}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Account Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Account Type</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="accountType"
              value="any"
              checked={accountType === 'any'}
              onChange={(e) => setAccountType(e.target.value as 'any')}
              className="text-blue-600"
            />
            <span className="text-sm">Any</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="accountType"
              value="brand"
              checked={accountType === 'brand'}
              onChange={(e) => setAccountType(e.target.value as 'brand')}
              className="text-blue-600"
            />
            <span className="text-sm">Brand</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="accountType"
              value="human"
              checked={accountType === 'human'}
              onChange={(e) => setAccountType(e.target.value as 'human')}
              className="text-blue-600"
            />
            <span className="text-sm">Human</span>
          </label>
        </div>
      </div>

      {/* Verified Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Verified Status</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="verified"
              value="any"
              checked={verified === null}
              onChange={() => setVerified(null)}
              className="text-blue-600"
            />
            <span className="text-sm">Any</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="verified"
              value="verified"
              checked={verified === true}
              onChange={() => setVerified(true)}
              className="text-blue-600"
            />
            <span className="text-sm">Verified Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="verified"
              value="non-verified"
              checked={verified === false}
              onChange={() => setVerified(false)}
              className="text-blue-600"
            />
            <span className="text-sm">Non-verified Only</span>
          </label>
        </div>
      </div>

      {/* AQS Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Audience Quality Score (AQS)</label>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{aqsRange.min}</span>
            <span>{aqsRange.max}</span>
          </div>
          <Slider
            value={[aqsRange.min, aqsRange.max]}
            onValueChange={(value) => setAqsRange({min: value[0], max: value[1]})}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* CQS Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Channel Quality Score (CQS)</label>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{cqsRange.min}</span>
            <span>{cqsRange.max}</span>
          </div>
          <Slider
            value={[cqsRange.min, cqsRange.max]}
            onValueChange={(value) => setCqsRange({min: value[0], max: value[1]})}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
