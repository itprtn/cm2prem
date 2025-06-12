import { Contract } from '../types'; // Assuming types.ts is in ../

interface CommissionArgs {
  insurerName?: string;
  monthlyPremium: number;
}

// Ensure this return type matches the commission fields in the Contract type
interface CommissionResult {
  commissionType?: 'Précompte' | 'Linéaire';
  firstYearCommissionRate?: number;
  recurrentCommissionRate?: number;
  monthlyCommission?: number;
  annualCommission?: number;
  firstYearAnnualNetCommission?: number;
  recurrentAnnualGrossCommission?: number;
  recurrentAnnualNetCommission?: number;
}

// Simplified commission rules based on insurer name
const commissionRules: { [key: string]: { type: 'Précompte' | 'Linéaire', fyRate: number, rRate: number, netFactor: number } } = {
  'APRIL': { type: 'Précompte', fyRate: 15, rRate: 5, netFactor: 0.8 },
  'SOLLY AZAR': { type: 'Linéaire', fyRate: 10, rRate: 10, netFactor: 0.75 },
  'NÉOLIANE': { type: 'Précompte', fyRate: 18, rRate: 4, netFactor: 0.85 },
  'SPVIE': { type: 'Linéaire', fyRate: 12, rRate: 8, netFactor: 0.8 },
  'Default': { type: 'Linéaire', fyRate: 8, rRate: 3, netFactor: 0.7 }, // Default for unknown insurers
};

export const calculateContractCommissions = (args: CommissionArgs): CommissionResult => {
  const rule = commissionRules[args.insurerName || 'Default'] || commissionRules['Default'];

  const monthlyCommission = (args.monthlyPremium * rule.fyRate) / 100;
  const annualCommission = monthlyCommission * 12; // Gross annual for first year
  const firstYearAnnualNetCommission = annualCommission * rule.netFactor;

  const recurrentAnnualGrossCommission = (args.monthlyPremium * rule.rRate) / 100 * 12;
  const recurrentAnnualNetCommission = recurrentAnnualGrossCommission * rule.netFactor;

  return {
    commissionType: rule.type,
    firstYearCommissionRate: rule.fyRate,
    recurrentCommissionRate: rule.rRate,
    monthlyCommission: parseFloat(monthlyCommission.toFixed(2)),
    annualCommission: parseFloat(annualCommission.toFixed(2)), // First year gross annual
    firstYearAnnualNetCommission: parseFloat(firstYearAnnualNetCommission.toFixed(2)),
    recurrentAnnualGrossCommission: parseFloat(recurrentAnnualGrossCommission.toFixed(2)),
    recurrentAnnualNetCommission: parseFloat(recurrentAnnualNetCommission.toFixed(2)),
  };
};
