import { EmailTemplate } from './types';

export const PREMUNIA_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'relance_j0',
    name: 'Relance J+0 : Demande de mutuelle',
    subject: '[Premunia] Bonjour %PRÉNOM%, rappel de votre demande de mutuelle',
    body: 
`Bonjour %PRÉNOM%,

Vous avez demandé un devis sur Premunia le %DATE_DEMANDE%. Souhaitez-vous toujours recevoir notre proposition ?

👉 Cliquez ici pour un devis instantané : %LIEN_DEVIS%

Albert Dubois
Conseiller en assurance santé
Premunia – www.premunia.com
📞 +33 1 83 62 78 66`
  },
  {
    id: 'relance_j5',
    name: 'Relance J+5 : Réduire budget santé',
    subject: '[Premunia] %PRÉNOM%, comment réduire votre budget santé ?',
    body:
`Bonjour %PRÉNOM%,

87% de nos clients seniors ont amélioré leur couverture tout en économisant jusqu’à 30%.
Optique, dentaire, hospitalisation : nous adaptons tout à votre budget.

👉 Pour un devis gratuit : %LIEN_DEVIS%

Albert Dubois
Conseiller en assurance santé
Premunia – www.premunia.com
📞 +33 1 83 62 78 66`
  },
  {
    id: 'relance_j12',
    name: 'Relance J+12 : Dernière relance',
    subject: '[Premunia] Dernière relance avant clôture de votre dossier',
    body:
`Bonjour %PRÉNOM%,

Nous n’avons pas encore échangé : je clôture votre demande dans 48h.
Répondez “RDV” ou “Devis” OU cliquez ci-dessous, et je m’en occupe :

👉 %LIEN_DEVIS%

Albert Dubois
Conseiller en assurance santé
Premunia – www.premunia.com
📞 +33 1 83 62 78 66`
  }
];

export const generateDevisLink = (prospectId: string, sequenceStep: number): string => {
  return `https://premunia.fr/devis?leadId=${prospectId}&seq=${sequenceStep}`;
};

export const formatDateForEmail = (dateString?: string): string => {
    if (!dateString) return 'date inconnue';
    // Assuming dateString is DD/MM/YYYY, needs to be parsed if used with new Date() for formatting
    // For direct use in email, the DD/MM/YYYY format is fine.
    return dateString;
};
