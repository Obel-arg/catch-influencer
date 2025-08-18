import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  X 
} from "lucide-react";

interface InfluencerFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPlatform: string;
  setFilterPlatform: (platform: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  onClose?: () => void;
}

interface InfluencerFiltersButtonProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export const InfluencerFiltersButton = ({ showFilters, setShowFilters }: InfluencerFiltersButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`bg-white shadow-none flex items-center justify-center rounded-lg border-0 gap-2 px-4 h-10 font-semibold text-base text-gray-800 focus:ring-0 focus:outline-none ${showFilters ? 'bg-blue-50 text-blue-600' : ''}`}
      onClick={() => setShowFilters(!showFilters)}
    >
      <Filter className="h-5 w-5 text-gray-700" />
      Filtros
      {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
    </Button>
  );
};

export const InfluencerFilters = ({
  searchQuery,
  setSearchQuery,
  filterPlatform,
  setFilterPlatform,
  sortBy,
  setSortBy,
  onClearFilters,
  onClose
}: InfluencerFiltersProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg w-[22rem]">
      <div className="grid grid-cols-1 gap-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            className="pl-9 h-9 !border-gray-300 focus:!border-gray-400 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="h-9 !border-gray-300 focus:!border-gray-400 rounded-md">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las plataformas</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>



        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-9 !border-gray-300 focus:!border-gray-400 rounded-md">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Seleccionar orden</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="followers">Followers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClearFilters}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}; 