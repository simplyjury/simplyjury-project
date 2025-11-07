'use client';

// Epic 07 - Admin Subscriptions Management Page
// Allows admins to view and manage training center subscriptions

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Crown, 
  Gift, 
  Zap, 
  Calendar,
  Users,
  TrendingUp,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { GrantPremiumModal } from '@/components/admin/grant-premium-modal';
import { SetLimitModal } from '@/components/admin/set-limit-modal';
import { RefundContactModal } from '@/components/admin/refund-contact-modal';

interface TrainingCenter {
  id: number;
  name: string;
  email: string;
  subscriptionTier: 'gratuit' | 'basic' | 'pro';
  contactsUsed: number;
  contactsLimit: number;
  firstAcceptedContactDate: string | null;
  hasPremiumAccess: boolean;
  premiumAccessExpiresAt: string | null;
  manualContactLimit: number | null;
  manualLimitExpiresAt: string | null;
}

export default function AdminSubscriptionsPage() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<TrainingCenter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<TrainingCenter | null>(null);
  const [showGrantPremiumModal, setShowGrantPremiumModal] = useState(false);
  const [showSetLimitModal, setShowSetLimitModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [searchQuery, filterTier, centers]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      // TODO: Create admin API endpoint to fetch all centers with subscription data
      const response = await fetch('/api/admin/subscriptions/centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les centres',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCenters = () => {
    let filtered = centers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tier
    if (filterTier !== 'all') {
      filtered = filtered.filter(center => center.subscriptionTier === filterTier);
    }

    setFilteredCenters(filtered);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gratuit': return <Gift className="h-4 w-4" />;
      case 'basic': return <Zap className="h-4 w-4" />;
      case 'pro': return <Crown className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gratuit': return 'bg-gray-100 text-gray-700';
      case 'basic': return 'bg-blue-100 text-blue-700';
      case 'pro': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleGrantPremium = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setShowGrantPremiumModal(true);
  };

  const handleSetLimit = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setShowSetLimitModal(true);
  };

  const handleRefund = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setShowRefundModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
          Gestion des Abonnements
        </h1>
        <p className="text-gray-600">
          Gérez les abonnements et limites de contacts des centres de formation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Centres</p>
                <p className="text-2xl font-bold text-[#0d4a70]">{centers.length}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan Gratuit</p>
                <p className="text-2xl font-bold text-gray-700">
                  {centers.filter(c => c.subscriptionTier === 'gratuit').length}
                </p>
              </div>
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan Basic</p>
                <p className="text-2xl font-bold text-blue-700">
                  {centers.filter(c => c.subscriptionTier === 'basic').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan Pro</p>
                <p className="text-2xl font-bold text-purple-700">
                  {centers.filter(c => c.subscriptionTier === 'pro').length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13d090]"
            >
              <option value="all">Tous les plans</option>
              <option value="gratuit">Gratuit</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>

            {/* Refresh */}
            <Button
              onClick={fetchCenters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Centres de Formation ({filteredCenters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement...
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun centre trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Centre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan / Accès
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contacts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCenters.map((center) => (
                    <tr key={center.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{center.name}</p>
                          <p className="text-sm text-gray-500">{center.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {/* Show effective access */}
                          {center.hasPremiumAccess ? (
                            <>
                              <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1 w-fit">
                                <Crown className="h-3 w-3" />
                                Premium (Accès temporaire)
                              </Badge>
                              {center.premiumAccessExpiresAt && (
                                <p className="text-xs text-gray-500">
                                  Expire: {new Date(center.premiumAccessExpiresAt).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                Plan de base: {center.subscriptionTier.charAt(0).toUpperCase() + center.subscriptionTier.slice(1)}
                              </p>
                            </>
                          ) : (
                            <Badge className={`${getTierColor(center.subscriptionTier)} flex items-center gap-1 w-fit`}>
                              {getTierIcon(center.subscriptionTier)}
                              {center.subscriptionTier.charAt(0).toUpperCase() + center.subscriptionTier.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            center.contactsUsed >= center.contactsLimit ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {center.contactsUsed}/{center.contactsLimit}
                          </span>
                          {center.manualContactLimit && (
                            <Badge variant="outline" className="text-xs">
                              Manuel: {center.manualContactLimit}
                            </Badge>
                          )}
                          {center.firstAcceptedContactDate && (
                            <p className="text-xs text-gray-500">
                              Période: {new Date(center.firstAcceptedContactDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGrantPremium(center)}
                            className="text-xs"
                          >
                            Premium
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetLimit(center)}
                            className="text-xs"
                          >
                            Limite
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(center)}
                            className="text-xs"
                            disabled={center.contactsUsed === 0}
                          >
                            Rembourser
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showGrantPremiumModal && selectedCenter && (
        <GrantPremiumModal
          center={selectedCenter}
          onClose={() => {
            setShowGrantPremiumModal(false);
            setSelectedCenter(null);
          }}
          onSuccess={fetchCenters}
        />
      )}

      {showSetLimitModal && selectedCenter && (
        <SetLimitModal
          center={selectedCenter}
          onClose={() => {
            setShowSetLimitModal(false);
            setSelectedCenter(null);
          }}
          onSuccess={fetchCenters}
        />
      )}

      {showRefundModal && selectedCenter && (
        <RefundContactModal
          center={selectedCenter}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedCenter(null);
          }}
          onSuccess={fetchCenters}
        />
      )}
    </div>
  );
}
