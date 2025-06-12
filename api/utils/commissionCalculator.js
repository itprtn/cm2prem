// Utilitaire pour calculer les commissions
class CommissionCalculator {
    // Calculer les commissions selon les règles de la compagnie
    static calculateCommissions(monthlyPremium, insurerConfig) {
        const {
            commission_type: commissionType,
            first_year_rate: firstYearRate,
            recurrent_rate: recurrentRate,
            net_factor: netFactor
        } = insurerConfig;

        const monthlyCommission = (monthlyPremium * firstYearRate) / 100;
        const annualCommission = monthlyCommission * 12;
        const firstYearAnnualNetCommission = annualCommission * netFactor;
        const recurrentAnnualGrossCommission = (monthlyPremium * recurrentRate) / 100 * 12;
        const recurrentAnnualNetCommission = recurrentAnnualGrossCommission * netFactor;

        return {
            commissionType,
            firstYearCommissionRate: firstYearRate,
            recurrentCommissionRate: recurrentRate,
            monthlyCommission: parseFloat(monthlyCommission.toFixed(2)),
            annualCommission: parseFloat(annualCommission.toFixed(2)),
            firstYearAnnualNetCommission: parseFloat(firstYearAnnualNetCommission.toFixed(2)),
            recurrentAnnualGrossCommission: parseFloat(recurrentAnnualGrossCommission.toFixed(2)),
            recurrentAnnualNetCommission: parseFloat(recurrentAnnualNetCommission.toFixed(2))
        };
    }

    // Calculer les commissions avec configuration par défaut
    static calculateDefaultCommissions(monthlyPremium) {
        const defaultConfig = {
            commission_type: 'Linéaire',
            first_year_rate: 8.00,
            recurrent_rate: 3.00,
            net_factor: 0.70
        };

        return this.calculateCommissions(monthlyPremium, defaultConfig);
    }

    // Calculer le ROI d'un contrat
    static calculateROI(contract, acquisitionCost = 0) {
        const totalCommission = contract.firstYearAnnualNetCommission + 
                               (contract.recurrentAnnualNetCommission * 4); // 5 ans total
        const roi = acquisitionCost > 0 ? ((totalCommission - acquisitionCost) / acquisitionCost) * 100 : 0;
        
        return {
            totalCommission5Years: parseFloat(totalCommission.toFixed(2)),
            acquisitionCost,
            roi: parseFloat(roi.toFixed(2)),
            paybackMonths: acquisitionCost > 0 ? Math.ceil(acquisitionCost / contract.monthlyCommission) : 0
        };
    }

    // Projeter les commissions futures
    static projectFutureCommissions(contracts, years = 5) {
        const projection = [];
        
        for (let year = 1; year <= years; year++) {
            let yearlyCommission = 0;
            
            contracts.forEach(contract => {
                if (year === 1) {
                    yearlyCommission += contract.firstYearAnnualNetCommission || 0;
                } else {
                    yearlyCommission += contract.recurrentAnnualNetCommission || 0;
                }
            });
            
            projection.push({
                year,
                commission: parseFloat(yearlyCommission.toFixed(2)),
                contracts: contracts.length
            });
        }
        
        return projection;
    }
}

module.exports = CommissionCalculator;