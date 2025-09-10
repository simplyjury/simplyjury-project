'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, Building, User, MessageCircle, Send, X } from 'lucide-react';

interface TrainingCenter {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  region?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
}

interface ContactCenterModalProps {
  center: TrainingCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactCenterModal({ center, isOpen, onClose }: ContactCenterModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    contactMethod: 'email' as 'email' | 'phone'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact-center', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingCenterId: center.id,
          subject: formData.subject,
          message: formData.message,
          contactMethod: formData.contactMethod
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            subject: '',
            message: '',
            contactMethod: 'email'
          });
          setSubmitStatus('idle');
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
      
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        subject: '',
        message: '',
        contactMethod: 'email'
      });
      setSubmitStatus('idle');
      onClose();
    }
  };

  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0d4a70]">
            <MessageCircle className="h-5 w-5" />
            Contacter {center.name}
          </DialogTitle>
        </DialogHeader>

        {/* Center Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#fdce0f] to-[#fee88c] rounded-xl flex items-center justify-center text-[#0d4a70] font-bold flex-shrink-0">
              {center.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0d4a70] mb-1">{center.name}</h3>
              {center.city && center.region && (
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <Building className="h-4 w-4 mr-1" />
                  {center.city}, {center.region}
                </div>
              )}
              <div className="space-y-1 text-sm text-gray-600">
                <p className="text-gray-500 italic">
                  Les coordonnées de contact seront partagées après validation de votre demande.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Objet du message</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Ex: Proposition de services de jury professionnel"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Présentez-vous et décrivez vos services..."
              rows={6}
              required
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Décrivez votre expérience, vos domaines d'expertise et votre disponibilité.
            </p>
          </div>

          {/* Contact Method Preference */}
          <div className="space-y-2">
            <Label>Méthode de contact préférée</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.contactMethod === 'email'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactMethod: e.target.value as 'email' | 'phone' }))}
                  disabled={isSubmitting}
                  className="text-[#13d090]"
                />
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={formData.contactMethod === 'phone'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactMethod: e.target.value as 'email' | 'phone' }))}
                  disabled={isSubmitting}
                  className="text-[#13d090]"
                />
                <Phone className="h-4 w-4" />
                <span className="text-sm">Téléphone</span>
              </label>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Votre message a été envoyé avec succès ! Le centre sera notifié de votre demande.
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
              className="flex-1 bg-[#13d090] hover:bg-[#0fb378] text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
