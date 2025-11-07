'use client';

// Epic 07 - Contact Usage Chart Component
// Visual chart showing contact usage over time

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import type { ContactStats } from '@/lib/types/subscription';

interface ContactUsageChartProps {
  className?: string;
}

export function ContactUsageChart({ className = '' }: ContactUsageChartProps) {
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/subscription/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError('Erreur de chargement');
      console.error('Error fetching contact stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{error || 'Données non disponibles'}</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = stats.currentPeriod.limit > 0
    ? Math.round((stats.currentPeriod.used / stats.currentPeriod.limit) * 100)
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistiques d'utilisation
        </CardTitle>
        <CardDescription>
          Suivez votre consommation de contacts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Period */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Période actuelle</h3>
            <span className="text-sm text-gray-600">
              {usagePercentage}% utilisé
            </span>
          </div>
          
          {/* Visual Bar */}
          <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                usagePercentage >= 100 ? 'bg-red-500' :
                usagePercentage >= 80 ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-900">
                {stats.currentPeriod.used} / {stats.currentPeriod.limit}
              </span>
            </div>
          </div>

          {stats.currentPeriod.startDate && stats.currentPeriod.endDate && (
            <p className="text-xs text-gray-500 mt-2">
              Du {new Date(stats.currentPeriod.startDate).toLocaleDateString('fr-FR')} au{' '}
              {new Date(stats.currentPeriod.endDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-900">
              {stats.history.totalContactsAllTime}
            </p>
            <p className="text-xs text-blue-700">Total contacts</p>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-900">
              {stats.history.averagePerPeriod}
            </p>
            <p className="text-xs text-green-700">Moyenne/période</p>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-900">
              {stats.history.periodsCompleted}
            </p>
            <p className="text-xs text-purple-700">Périodes</p>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity && stats.recentActivity.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Activité récente
            </h3>
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.juryName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.certificationTitle}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Activity Message */}
        {(!stats.recentActivity || stats.recentActivity.length === 0) && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Aucun contact utilisé pour le moment
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Commencez à contacter des jurys pour voir vos statistiques
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
