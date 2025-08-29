import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
  active_count: number;
  total_count: number;
  total_candidates: number;
  average_success_rate: number;
}

interface CertificationStatsProps {
  stats: StatsData;
  loading?: boolean;
}

export function CertificationStats({ stats, loading = false }: CertificationStatsProps) {
  const statCards = [
    {
      value: stats.active_count,
      label: "Certifications actives",
      color: "border-t-[#13d090]",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      value: stats.total_count,
      label: "Total certifications",
      color: "border-t-purple-400",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50"
    },
    {
      value: stats.total_candidates,
      label: "Candidats cette année",
      color: "border-t-[#fdce0f]",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50"
    },
    {
      value: `${stats.average_success_rate}%`,
      label: "Taux de réussite",
      color: "border-t-[#0c608a]",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className={`${card.color} border-t-4 ${card.bgColor}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {card.value}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">
              {card.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
