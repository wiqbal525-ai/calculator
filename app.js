function num(id) {
    return Number(document.getElementById(id).value || 0);
}

function pmt(monthlyRate, nper, pv) {
    if (nper <= 0) return 0;
    if (monthlyRate === 0) return -(pv / nper);
    const pow = Math.pow(1 + monthlyRate, nper);
    return -((pv * monthlyRate * pow) / (pow - 1));
}

function parseMonthAmountLines(text) {
    const map = new Map();
    const lines = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    for (const line of lines) {
        const [mStr, vStr] = line.split(",").map((x) => x.trim());
        const month = Number(mStr);
        const value = Number(vStr);
        if (Number.isFinite(month) && month >= 1 && Number.isFinite(value) && value >= 0) {
            map.set(month, value);
        }
    }
    return map;
}

function parseResets(text, initialRate) {
    const rows = [];
    const lines = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    for (const line of lines) {
        const [mStr, rStr] = line.split(",").map((x) => x.trim());
        const month = Number(mStr);
        const annualRatePct = Number(rStr);
        if (Number.isFinite(month) && month >= 1 && Number.isFinite(annualRatePct) && annualRatePct >= 0) {
            rows.push({ month, annualRate: annualRatePct / 100 });
        }
    }
    if (!rows.some((r) => r.month === 1)) {
        rows.push({ month: 1, annualRate: initialRate });
    }
    rows.sort((a, b) => a.month - b.month);
    return rows.filter((r, i) => i === 0 || r.month !== rows[i - 1].month);
}

function round2(x) {
    return Math.round((x + Number.EPSILON) * 100) / 100;
}

function money(x) {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(x);
}

function pct(x) {
    return `${(x * 100).toFixed(2)}%`;
}

function ontarioLandTransferTax(price) {
    const p = Math.max(0, price || 0);
    let tax = 0;
    tax += Math.min(p, 55000) * 0.005;
    if (p > 55000) tax += (Math.min(p, 250000) - 55000) * 0.01;
    if (p > 250000) tax += (Math.min(p, 400000) - 250000) * 0.015;
    if (p > 400000) tax += (Math.min(p, 2000000) - 400000) * 0.02;
    if (p > 2000000) tax += (p - 2000000) * 0.025;
    return tax;
}

function buildModel() {
    const purchasePrice = num("purchasePrice");
    const financingAmount = num("financingAmount");
    const initialProfitRate = num("initialProfitRate") / 100;
    const termMonths = Math.max(1, Math.floor(num("termMonths")));
    const propertyGrowthRate = num("propertyGrowthRate") / 100;
    const sellingCommissionRate = num("sellingCommissionRate") / 100;
    const hstRate = num("hstRate") / 100;
    const legalFees = num("legalFees");
    const dischargeFee = num("dischargeFee");
    const otherCosts = num("otherCosts");
    const adminFeeRate = num("adminFeeRate") / 100;
    const investmentPortfolio = num("investmentPortfolio");
    const estimatedLegalFeesClosing = num("estimatedLegalFeesClosing");
    const appraisalFee = num("appraisalFee");
    const otherClosingCosts = num("otherClosingCosts");
    const adminFee = financingAmount * adminFeeRate;
    const landTransferTax = ontarioLandTransferTax(purchasePrice);
    const totalClosingCosts = adminFee + investmentPortfolio + estimatedLegalFeesClosing + landTransferTax + appraisalFee + otherClosingCosts;

    const initialOwnership = purchasePrice > 0 ? 1 - financingAmount / purchasePrice : 0;
    const prepayments = parseMonthAmountLines(document.getElementById("prepaymentSchedule").value);
    const resets = parseResets(document.getElementById("resetSchedule").value, initialProfitRate);

    const months = [];
    let balance = financingAmount;
    let cumulativeEquity = 0;
    let resetIdx = -1;
    let currentRate = initialProfitRate;
    let currentPayment = pmt(initialProfitRate / 12, termMonths, -financingAmount);

    for (let m = 1; m <= termMonths; m += 1) {
        if (balance <= 0) break;
        while (resetIdx + 1 < resets.length && resets[resetIdx + 1].month === m) {
            resetIdx += 1;
            currentRate = resets[resetIdx].annualRate;
            const remainingTerm = termMonths - m + 1;
            currentPayment = pmt(currentRate / 12, remainingTerm, -balance);
        }

        const opening = balance;
        const profit = opening * (currentRate / 12);
        const payment = Math.min(currentPayment, opening + profit);
        const equityRegular = Math.max(0, payment - profit);
        const rawPrepay = prepayments.get(m) || 0;
        const equityPrepay = Math.min(rawPrepay, Math.max(0, opening - equityRegular));
        const totalEquity = equityRegular + equityPrepay;
        const closing = Math.max(0, opening - totalEquity);
        cumulativeEquity += totalEquity;
        const unitTransfer = totalEquity;
        const shareTransfer = purchasePrice > 0 ? unitTransfer / purchasePrice : 0;

        const ownership = purchasePrice > 0 ? Math.min(1, initialOwnership + cumulativeEquity / purchasePrice) : 0;
        const recognized = ownership;
        const lttTrigger = false;

        months.push({
            month: m, opening, payment, prepay: rawPrepay, profit, equityRegular, equityPrepay, totalEquity,
            closing, ownership, recognized, lttTrigger, unitTransfer, shareTransfer
        });

        balance = closing;
    }

    const quarterRows = [];
    for (let i = 0; i < months.length; i += 3) {
        const chunk = months.slice(i, i + 3);
        const end = chunk[chunk.length - 1];
        const prev = quarterRows[quarterRows.length - 1];
        const totalEquity = chunk.reduce((s, r) => s + r.totalEquity, 0);
        const unitTransfer = chunk.reduce((s, r) => s + r.unitTransfer, 0);
        quarterRows.push({
            quarter: quarterRows.length + 1,
            startMonth: chunk[0].month,
            endMonth: end.month,
            opening: chunk[0].opening,
            payment: chunk.reduce((s, r) => s + r.payment, 0),
            prepay: chunk.reduce((s, r) => s + r.prepay, 0),
            profit: chunk.reduce((s, r) => s + r.profit, 0),
            equityRegular: chunk.reduce((s, r) => s + r.equityRegular, 0),
            equityPrepay: chunk.reduce((s, r) => s + r.equityPrepay, 0),
            totalEquity,
            unitTransfer,
            shareTransfer: purchasePrice > 0 ? unitTransfer / purchasePrice : 0,
            recognizedTransfer: prev ? end.recognized - prev.recognizedEnd : end.recognized - initialOwnership,
            closing: end.closing,
            ownershipEnd: end.ownership,
            recognizedEnd: end.recognized,
            ltt: chunk.some((r) => r.lttTrigger) ? "⚠ LTT Trigger" : "OK"
        });
    }

    const annualRows = [];
    for (let i = 0; i < months.length; i += 12) {
        const chunk = months.slice(i, i + 12);
        const end = chunk[chunk.length - 1];
        const prev = annualRows[annualRows.length - 1];
        const totalEquity = chunk.reduce((s, r) => s + r.totalEquity, 0);
        const unitTransfer = chunk.reduce((s, r) => s + r.unitTransfer, 0);
        annualRows.push({
            year: annualRows.length + 1,
            startMonth: chunk[0].month,
            endMonth: end.month,
            opening: chunk[0].opening,
            payment: chunk.reduce((s, r) => s + r.payment, 0),
            prepay: chunk.reduce((s, r) => s + r.prepay, 0),
            profit: chunk.reduce((s, r) => s + r.profit, 0),
            equityRegular: chunk.reduce((s, r) => s + r.equityRegular, 0),
            equityPrepay: chunk.reduce((s, r) => s + r.equityPrepay, 0),
            totalEquity,
            unitTransfer,
            shareTransfer: purchasePrice > 0 ? unitTransfer / purchasePrice : 0,
            recognizedTransfer: prev ? end.recognized - prev.recognizedEnd : end.recognized - initialOwnership,
            closing: end.closing,
            ownershipEnd: end.ownership,
            recognizedEnd: end.recognized,
            ltt: chunk.some((r) => r.lttTrigger) ? "⚠ LTT Trigger" : "OK"
        });
    }

    const saleRows = [];
    const maxYears = Math.ceil(termMonths / 12);
    let prevSaleRecognized = initialOwnership;
    for (let year = 1; year <= maxYears; year += 1) {
        const saleMonth = Math.min(year * 12, months.length);
        if (saleMonth < 1) break;
        const end = months[saleMonth - 1];
        const yearStartMonth = Math.max(1, (year - 1) * 12 + 1);
        const annualChunk = months.slice(yearStartMonth - 1, saleMonth);
        const annualEquityRegular = annualChunk.reduce((s, r) => s + r.equityRegular, 0);
        const annualEquityPrepay = annualChunk.reduce((s, r) => s + r.equityPrepay, 0);
        const annualTotalEquity = annualEquityRegular + annualEquityPrepay;
        const annualShareTransfer = purchasePrice > 0 ? annualTotalEquity / purchasePrice : 0;
        const annualRecognizedTransfer = end.recognized - prevSaleRecognized;
        const estimatedSalePrice = purchasePrice * Math.pow(1 + propertyGrowthRate, year);
        const sellingCommission = estimatedSalePrice * sellingCommissionRate;
        const hstCommission = sellingCommission * hstRate;
        const totalSellingCosts = sellingCommission + hstCommission + legalFees + dischargeFee + otherCosts;
        const netBeforeSplit = estimatedSalePrice - totalSellingCosts;
        const yourShare = netBeforeSplit * end.recognized;
        const manzilShare = netBeforeSplit * (1 - end.recognized);

        const upto = months.slice(0, saleMonth);
        const cumulativePayment = upto.reduce((s, r) => s + r.payment, 0);
        const cumulativePrepay = upto.reduce((s, r) => s + r.prepay, 0);
        const cumulativeTotalPaid = cumulativePayment + cumulativePrepay;
        const cumulativeProfitPaid = upto.reduce((s, r) => s + r.profit, 0);
        const cumulativePrincipalPaid = upto.reduce((s, r) => s + r.totalEquity, 0);
        const totalCashInvested = purchasePrice * initialOwnership + totalClosingCosts + cumulativeTotalPaid;
        const netGainWaterfall = yourShare - totalCashInvested;
        const roiWaterfall = totalCashInvested > 0 ? netGainWaterfall / totalCashInvested : 0;

        const remainingBalance = end.closing;
        const netCashPayoff = netBeforeSplit - remainingBalance;
        const netGainPayoff = netCashPayoff - totalCashInvested;
        const roiPayoff = totalCashInvested > 0 ? netGainPayoff / totalCashInvested : 0;

        saleRows.push({
            year, saleMonth, estimatedSalePrice, sellingCommission, hstCommission, legalFees, dischargeFee, otherCosts,
            totalSellingCosts, netBeforeSplit, ownershipEnd: end.ownership, recognizedEnd: end.recognized,
            annualEquityRegular, annualEquityPrepay, annualTotalEquity, annualShareTransfer, annualRecognizedTransfer,
            adminFee, investmentPortfolio, estimatedLegalFeesClosing, landTransferTax, appraisalFee, otherClosingCosts, totalClosingCosts,
            manzilOwnershipEnd: 1 - end.recognized, yourShare, manzilShare, cumulativePayment, cumulativePrepay,
            cumulativeTotalPaid, cumulativeProfitPaid, cumulativePrincipalPaid, totalCashInvested, netGainWaterfall,
            roiWaterfall, remainingBalance, netCashPayoff, netGainPayoff, roiPayoff
        });
        prevSaleRecognized = end.recognized;
    }

    return { initialOwnership, months, quarterRows, annualRows, saleRows };
}

function buildRentVsRows(model) {
    const monthlyRent = num("monthlyRent");
    const tenantInsuranceMonthly = num("tenantInsuranceMonthly");
    const utilitiesMonthly = num("utilitiesMonthly");
    const annualRentGrowthRate = num("annualRentGrowthRate") / 100;
    const rentDeposit = num("rentDeposit");
    const movingCosts = num("movingCosts");
    const propertyTaxMonthly = num("propertyTaxMonthly");
    const homeInsuranceMonthly = num("homeInsuranceMonthly");
    const musharakaUtilitiesMonthly = num("musharakaUtilitiesMonthly");
    const maintenanceMonthly = num("maintenanceMonthly");
    const sensitivityDeltaPct = num("sensitivityDeltaPct") / 100;

    const termMonths = Math.max(1, Math.floor(num("termMonths")));
    const maxYears = Math.ceil(termMonths / 12);
    const horizons = Array.from({ length: maxYears }, (_, i) => i + 1);
    const initialOwnershipCash = num("purchasePrice") * model.initialOwnership;
    const firstSale = model.saleRows[0];
    const totalClosingCosts = firstSale ? firstSale.totalClosingCosts : 0;
    const upfrontMusharaka = initialOwnershipCash + totalClosingCosts;
    const upfrontRent = rentDeposit + movingCosts;

    const rows = horizons.map((year) => {
        const horizonMonths = Math.min(year * 12, model.months.length);
        const yearsUsed = horizonMonths / 12;
        const yearStartMonth = Math.max(1, (year - 1) * 12 + 1);
        const yearStartRow = model.months[yearStartMonth - 1] || model.months[model.months.length - 1];
        const musharakaMonthlyOutflow = (yearStartRow?.payment || 0) + propertyTaxMonthly + homeInsuranceMonthly + musharakaUtilitiesMonthly + maintenanceMonthly;
        const upto = model.months.slice(0, horizonMonths);
        const end = model.months[horizonMonths - 1];
        const cumulativeTotalPaid = upto.reduce((s, r) => s + r.payment + r.prepay, 0);
        const cumulativeProfitPaid = upto.reduce((s, r) => s + r.profit, 0);
        const cumulativeEquityRegular = upto.reduce((s, r) => s + r.equityRegular, 0);
        const cumulativeEquityPrepay = upto.reduce((s, r) => s + r.equityPrepay, 0);
        const totalEquity = cumulativeEquityRegular + cumulativeEquityPrepay;
        const yearSpecificRent = monthlyRent * Math.pow(1 + annualRentGrowthRate, Math.max(0, year - 1));
        const rentMonthlyOutflow = yearSpecificRent + tenantInsuranceMonthly + utilitiesMonthly;

        const cumulativeUnitTransfer = upto.reduce((s, r) => s + r.unitTransfer, 0);
        const annualUnitTransfer = cumulativeUnitTransfer / Math.max(1, year);
        const annualShareTransfer = num("purchasePrice") > 0 ? annualUnitTransfer / num("purchasePrice") : 0;
        const cumulativeShareTransfer = num("purchasePrice") > 0 ? cumulativeUnitTransfer / num("purchasePrice") : 0;
        const recognizedOwnership = end ? end.recognized : model.initialOwnership;

        let totalRentPayments = 0;
        for (let m = 1; m <= horizonMonths; m += 1) {
            const annualStep = Math.floor((m - 1) / 12);
            const grownRent = monthlyRent * Math.pow(1 + annualRentGrowthRate, annualStep);
            totalRentPayments += grownRent + tenantInsuranceMonthly + utilitiesMonthly;
        }
        const totalMushCarryCosts = (propertyTaxMonthly + homeInsuranceMonthly + musharakaUtilitiesMonthly + maintenanceMonthly) * horizonMonths;

        const totalOutOfPocketRent = upfrontRent + totalRentPayments;
        const totalOutOfPocketMusharaka = upfrontMusharaka + cumulativeTotalPaid + totalMushCarryCosts;

        const propertyGrowthRateBase = num("propertyGrowthRate") / 100;
        const salePriceBase = num("purchasePrice") * Math.pow(1 + propertyGrowthRateBase, yearsUsed);
        const salePriceLow = num("purchasePrice") * Math.pow(1 + Math.max(0, propertyGrowthRateBase - sensitivityDeltaPct), yearsUsed);
        const salePriceHigh = num("purchasePrice") * Math.pow(1 + propertyGrowthRateBase + sensitivityDeltaPct, yearsUsed);

        const sellingCommissionRate = num("sellingCommissionRate") / 100;
        const hstRate = num("hstRate") / 100;
        const legalFees = num("legalFees");
        const dischargeFee = num("dischargeFee");
        const otherCosts = num("otherCosts");

        const calcNetBeforeSplit = (price) => {
            const sellingCommission = price * sellingCommissionRate;
            const hstCommission = sellingCommission * hstRate;
            const totalSellingCosts = sellingCommission + hstCommission + legalFees + dischargeFee + otherCosts;
            return { totalSellingCosts, netBeforeSplit: price - totalSellingCosts };
        };
        const baseSale = calcNetBeforeSplit(salePriceBase);
        const lowSale = calcNetBeforeSplit(salePriceLow);
        const highSale = calcNetBeforeSplit(salePriceHigh);

        const remainingBalance = end ? end.closing : 0;
        const yourShareWaterfall = baseSale.netBeforeSplit * recognizedOwnership;
        const netCashPayoff = baseSale.netBeforeSplit - remainingBalance;
        const netGainPayoff = netCashPayoff - totalOutOfPocketMusharaka;
        const effectiveMusharakaCostWaterfallRaw = totalOutOfPocketMusharaka - yourShareWaterfall;
        const effectiveMusharakaCostWaterfall = -effectiveMusharakaCostWaterfallRaw;
        const effectiveRentCost = totalOutOfPocketRent;
        const unusedUpfrontCash = num("purchasePrice") * model.initialOwnership;
        const rentCostForComparison = effectiveRentCost - unusedUpfrontCash;
        const netPositionMusharaka = yourShareWaterfall - totalOutOfPocketMusharaka;
        const netPositionRent = -rentCostForComparison;
        const netPosition = netPositionMusharaka;
        const roiMusharaka = totalOutOfPocketMusharaka > 0 ? netPositionMusharaka / totalOutOfPocketMusharaka : 0;
        const roiRent = totalOutOfPocketRent > 0 ? netPositionRent / totalOutOfPocketRent : 0;
        const betterOption = effectiveMusharakaCostWaterfallRaw < rentCostForComparison ? "Musharaka" : "Rent";
        const betterBy = Math.abs(effectiveMusharakaCostWaterfallRaw - rentCostForComparison);

        const rentGrowthLow = Math.max(0, annualRentGrowthRate - sensitivityDeltaPct);
        const rentGrowthHigh = annualRentGrowthRate + sensitivityDeltaPct;
        let rentLowTotal = 0;
        let rentBaseTotal = 0;
        let rentHighTotal = 0;
        for (let m = 1; m <= horizonMonths; m += 1) {
            const annualStep = Math.floor((m - 1) / 12);
            rentLowTotal += monthlyRent * Math.pow(1 + rentGrowthLow, annualStep) + tenantInsuranceMonthly + utilitiesMonthly;
            rentBaseTotal += monthlyRent * Math.pow(1 + annualRentGrowthRate, annualStep) + tenantInsuranceMonthly + utilitiesMonthly;
            rentHighTotal += monthlyRent * Math.pow(1 + rentGrowthHigh, annualStep) + tenantInsuranceMonthly + utilitiesMonthly;
        }

        return {
            horizon: `${year}Y`,
            rentMonthlyOutflow,
            musharakaMonthlyOutflow,
            upfrontRent,
            upfrontMusharaka,
            cumulativeEquityRegular,
            cumulativeEquityPrepay,
            totalEquity,
            annualUnitTransfer,
            annualShareTransfer,
            cumulativeShareTransfer,
            recognizedOwnership,
            totalOutOfPocketRent,
            totalOutOfPocketMusharaka,
            effectiveRentCost,
            effectiveMusharakaCostWaterfall,
            netPosition,
            roiMusharaka,
            roiRent,
            betterOption,
            betterBy,
            estimatedSalePrice: salePriceBase,
            totalSellingCosts: baseSale.totalSellingCosts,
            netSaleBeforeSplit: baseSale.netBeforeSplit,
            remainingBalance,
            netGainPayoff,
            yourShareWaterfall,
            cumulativeTotalPaid,
            cumulativeProfitPaid,
            totalCashInvested: totalOutOfPocketMusharaka,
            netSaleLow: lowSale.netBeforeSplit,
            netSaleBase: baseSale.netBeforeSplit,
            netSaleHigh: highSale.netBeforeSplit,
            rentOutLow: upfrontRent + rentLowTotal,
            rentOutBase: upfrontRent + rentBaseTotal,
            rentOutHigh: upfrontRent + rentHighTotal
        };
    });

    return rows;
}

function buildConventionalMonths() {
    const purchasePrice = num("purchasePrice");
    const termMonths = Math.max(1, Math.floor(num("termMonths")));
    const convMortgageAmount = num("convMortgageAmount");
    const convInitialRate = num("convInitialRate") / 100;
    const convAmortMonths = Math.max(1, Math.floor(num("convAmortMonths")));
    const convResets = parseResets(document.getElementById("convResetSchedule").value, convInitialRate);
    const convPrepayments = parseMonthAmountLines(document.getElementById("convPrepaymentSchedule").value);

    const months = [];
    let balance = convMortgageAmount;
    let resetIdx = -1;
    let currentRate = convInitialRate;
    let currentPayment = pmt(convInitialRate / 12, convAmortMonths, -convMortgageAmount);

    for (let m = 1; m <= termMonths; m += 1) {
        if (balance <= 0) break;
        while (resetIdx + 1 < convResets.length && convResets[resetIdx + 1].month === m) {
            resetIdx += 1;
            currentRate = convResets[resetIdx].annualRate;
            const remainingAmort = Math.max(1, convAmortMonths - m + 1);
            currentPayment = pmt(currentRate / 12, remainingAmort, -balance);
        }
        const opening = balance;
        const interest = opening * (currentRate / 12);
        const payment = Math.min(currentPayment, opening + interest);
        const principalRegular = Math.max(0, payment - interest);
        const rawPrepay = convPrepayments.get(m) || 0;
        const principalPrepay = Math.min(rawPrepay, Math.max(0, opening - principalRegular));
        const principalTotal = principalRegular + principalPrepay;
        const closing = Math.max(0, opening - principalTotal);
        const equityShare = purchasePrice > 0 ? Math.min(1, 1 - closing / purchasePrice) : 0;
        months.push({
            month: m, opening, payment, interest, principalRegular, principalPrepay, principalTotal, closing, equityShare
        });
        balance = closing;
    }
    return months;
}

function buildConvVsRows(model) {
    const convMonths = buildConventionalMonths();
    const purchasePrice = num("purchasePrice");
    const propertyGrowthRate = num("propertyGrowthRate") / 100;
    const sellingCommissionRate = num("sellingCommissionRate") / 100;
    const hstRate = num("hstRate") / 100;
    const legalFees = num("legalFees");
    const dischargeFee = num("dischargeFee");
    const otherCosts = num("otherCosts");
    const propertyTaxMonthly = num("propertyTaxMonthly");
    const homeInsuranceMonthly = num("homeInsuranceMonthly");
    const musharakaUtilitiesMonthly = num("musharakaUtilitiesMonthly");
    const maintenanceMonthly = num("maintenanceMonthly");
    const sharedMonthlyCarry = propertyTaxMonthly + homeInsuranceMonthly + musharakaUtilitiesMonthly + maintenanceMonthly;
    const horizons = [1, 3, 5, 10];

    const convMortgageAmount = num("convMortgageAmount");
    const convDownpayment = Math.max(0, purchasePrice - convMortgageAmount);
    const convLandTransferTax = ontarioLandTransferTax(purchasePrice);
    const convFees = num("convLenderFees") + num("convLegalFeesClosing") + num("convAppraisalFees") + num("convInsurancePremium") + num("convOtherClosingCosts");
    const upfrontConventional = convDownpayment + convLandTransferTax + convFees;

    const mushInitialEquity = purchasePrice * model.initialOwnership;
    const mushClosingCosts = model.saleRows[0] ? model.saleRows[0].totalClosingCosts : 0;
    const upfrontMusharaka = mushInitialEquity + mushClosingCosts;

    return horizons.map((year) => {
        const horizonMonths = year * 12;
        const mushMonthsUsed = Math.min(horizonMonths, model.months.length);
        const convMonthsUsed = Math.min(horizonMonths, convMonths.length);
        const mushUpto = model.months.slice(0, mushMonthsUsed);
        const convUpto = convMonths.slice(0, convMonthsUsed);
        const mushEnd = model.months[mushMonthsUsed - 1];
        const convEnd = convMonths[convMonthsUsed - 1];
        const yearsUsed = mushMonthsUsed / 12;

        const mushPrincipal = mushUpto.reduce((s, r) => s + r.totalEquity, 0);
        const convPrincipal = convUpto.reduce((s, r) => s + r.principalTotal, 0);
        const annualUnitTransferMush = mushPrincipal / Math.max(1, year);
        const annualUnitTransferConv = convPrincipal / Math.max(1, year);
        const annualShareTransferMush = purchasePrice > 0 ? annualUnitTransferMush / purchasePrice : 0;
        const annualShareTransferConv = purchasePrice > 0 ? annualUnitTransferConv / purchasePrice : 0;
        const mushPayments = mushUpto.reduce((s, r) => s + r.payment + r.prepay, 0);
        const convPayments = convUpto.reduce((s, r) => s + r.payment + r.principalPrepay, 0);
        const mushCarry = sharedMonthlyCarry * mushMonthsUsed;
        const convCarry = sharedMonthlyCarry * convMonthsUsed;
        const totalOutOfPocketMush = upfrontMusharaka + mushPayments + mushCarry;
        const totalOutOfPocketConv = upfrontConventional + convPayments + convCarry;

        const salePrice = purchasePrice * Math.pow(1 + propertyGrowthRate, yearsUsed);
        const sellingCommission = salePrice * sellingCommissionRate;
        const hstCommission = sellingCommission * hstRate;
        const totalSellingCosts = sellingCommission + hstCommission + legalFees + dischargeFee + otherCosts;
        const netSaleBeforeSplit = salePrice - totalSellingCosts;

        const mushRecognized = mushEnd ? mushEnd.recognized : model.initialOwnership;
        const mushYourShareWaterfall = netSaleBeforeSplit * mushRecognized;
        const convNetCashAtSale = netSaleBeforeSplit - (convEnd ? convEnd.closing : 0);

        const effectiveCostMush = totalOutOfPocketMush - mushYourShareWaterfall;
        const effectiveCostConv = totalOutOfPocketConv - convNetCashAtSale;
        const betterOption = effectiveCostMush < effectiveCostConv ? "Musharaka" : "Conventional";
        const betterBy = Math.abs(effectiveCostMush - effectiveCostConv);

        return {
            horizon: `${year}Y`,
            betterOption,
            betterBy,
            monthlyOutflowMush: (model.months[0]?.payment || 0) + sharedMonthlyCarry,
            monthlyOutflowConv: (convMonths[0]?.payment || 0) + sharedMonthlyCarry,
            upfrontMusharaka,
            upfrontConventional,
            annualPrincipalMush: mushPrincipal / Math.max(1, yearsUsed),
            annualPrincipalConv: convPrincipal / Math.max(1, yearsUsed),
            annualShareTransferMush,
            annualShareTransferConv,
            totalPrincipalMush: mushPrincipal,
            totalPrincipalConv: convPrincipal,
            recognizedOwnershipMush: mushRecognized,
            equityShareConv: convEnd ? convEnd.equityShare : 0,
            totalOutOfPocketMush,
            totalOutOfPocketConv,
            estimatedSalePrice: salePrice,
            totalSellingCosts,
            netSaleBeforeSplit,
            remainingBalanceMush: mushEnd ? mushEnd.closing : 0,
            remainingBalanceConv: convEnd ? convEnd.closing : 0,
            netCashAtSaleConv: convNetCashAtSale,
            effectiveCostMush,
            effectiveCostConv
        };
    });
}

function renderTable(id, columns, rows) {
    const table = document.getElementById(id);
    const thead = `<thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>`;
    const body = rows.map((row) => `<tr>${columns.map((c) => {
        const value = c.format ? c.format(row[c.key], row) : row[c.key];
        const cls = c.className ? c.className(row) : "";
        return `<td class="${cls}">${value ?? ""}</td>`;
    }).join("")}</tr>`).join("");
    table.innerHTML = `${thead}<tbody>${body}</tbody>`;
}

function render() {
    const model = buildModel();
    const showDetailQuarterly = document.getElementById("showDetailQuarterly")?.checked;
    const showDetailAnnual = document.getElementById("showDetailAnnual")?.checked;
    const showDetailSale = document.getElementById("showDetailSale")?.checked;
    const showDetailRentVs = document.getElementById("showDetailRentVs")?.checked;
    const showDetailConvVs = document.getElementById("showDetailConvVs")?.checked;
    const last = model.months[model.months.length - 1];
    const kpi = document.getElementById("kpiPanel");
    const firstSale = model.saleRows[0];
    kpi.innerHTML = `
    <h2>Key Results</h2>
    <div class="kpi-grid">
      <div class="kpi"><div class="label">Initial Ownership</div><div class="value">${pct(model.initialOwnership)}</div></div>
      <div class="kpi"><div class="label">Total Admin Fee</div><div class="value">${firstSale ? money(firstSale.adminFee) : "-"}</div></div>
      <div class="kpi"><div class="label">Ontario LTT</div><div class="value">${firstSale ? money(firstSale.landTransferTax) : "-"}</div></div>
      <div class="kpi"><div class="label">Total Closing Costs</div><div class="value">${firstSale ? money(firstSale.totalClosingCosts) : "-"}</div></div>
    </div>
  `;

    renderTable("monthlyTable", [
        { key: "month", label: "Month" },
        { key: "opening", label: "Opening Balance", format: money },
        { key: "payment", label: "Payment", format: money },
        { key: "prepay", label: "Prepayment", format: money },
        { key: "profit", label: "Profit", format: money },
        { key: "equityRegular", label: "Equity (Regular)", format: money },
        { key: "equityPrepay", label: "Equity (Prepay)", format: money },
        { key: "totalEquity", label: "Total Equity", format: money },
        { key: "closing", label: "Closing Balance", format: money },
        { key: "ownership", label: "Ownership %", format: pct },
        { key: "recognized", label: "Recognized Ownership %", format: pct },
        { key: "lttTrigger", label: "LTT Warning", format: (v) => (v ? "⚠ LTT Trigger" : "OK"), className: (r) => (r.lttTrigger ? "warn" : "") }
    ], model.months.map((r) => ({
        ...r,
        opening: round2(r.opening), payment: round2(r.payment), prepay: round2(r.prepay), profit: round2(r.profit),
        equityRegular: round2(r.equityRegular), equityPrepay: round2(r.equityPrepay), totalEquity: round2(r.totalEquity), closing: round2(r.closing)
    })));

    const quarterlyColumnsDetailed = [
        { key: "quarter", label: "Quarter" },
        { key: "startMonth", label: "Start Month" },
        { key: "endMonth", label: "End Month" },
        { key: "opening", label: "Opening Balance", format: money },
        { key: "payment", label: "Payment", format: money },
        { key: "prepay", label: "Prepayment", format: money },
        { key: "profit", label: "Profit", format: money },
        { key: "equityRegular", label: "Equity (Regular)", format: money },
        { key: "equityPrepay", label: "Equity (Prepay)", format: money },
        { key: "totalEquity", label: "Total Equity", format: money },
        { key: "unitTransfer", label: "Quarterly Unit Transfer", format: money },
        { key: "shareTransfer", label: "Share Transfer %", format: pct },
        { key: "recognizedTransfer", label: "Recognized Share Transfer %", format: pct },
        { key: "closing", label: "Closing Balance", format: money },
        { key: "ownershipEnd", label: "Ownership % (End)", format: pct },
        { key: "recognizedEnd", label: "Recognized Ownership % (End)", format: pct },
        { key: "ltt", label: "LTT Trigger?", className: (r) => (r.ltt.includes("⚠") ? "warn" : "") }
    ];
    const quarterlyColumnsCompact = [
        { key: "quarter", label: "Quarter" },
        { key: "startMonth", label: "Start" },
        { key: "endMonth", label: "End" },
        { key: "payment", label: "Payment", format: money },
        { key: "profit", label: "Profit", format: money },
        { key: "totalEquity", label: "Total Equity", format: money },
        { key: "closing", label: "Closing Balance", format: money },
        { key: "ownershipEnd", label: "Ownership %", format: pct },
        { key: "recognizedEnd", label: "Recognized %", format: pct },
        { key: "ltt", label: "LTT", className: (r) => (r.ltt.includes("⚠") ? "warn" : "") }
    ];
    renderTable("quarterlyTable", showDetailQuarterly ? quarterlyColumnsDetailed : quarterlyColumnsCompact, model.quarterRows.map((r) => ({ ...r, opening: round2(r.opening), payment: round2(r.payment), prepay: round2(r.prepay), profit: round2(r.profit), equityRegular: round2(r.equityRegular), equityPrepay: round2(r.equityPrepay), totalEquity: round2(r.totalEquity), unitTransfer: round2(r.unitTransfer), closing: round2(r.closing) })));

    const annualColumnsDetailed = [
        { key: "year", label: "Year" },
        { key: "startMonth", label: "Start Month" },
        { key: "endMonth", label: "End Month" },
        { key: "opening", label: "Opening Balance", format: money },
        { key: "payment", label: "Annual Payment", format: money },
        { key: "prepay", label: "Annual Prepayment", format: money },
        { key: "profit", label: "Annual Profit", format: money },
        { key: "equityRegular", label: "Annual Equity (Regular)", format: money },
        { key: "equityPrepay", label: "Annual Equity (Prepay)", format: money },
        { key: "totalEquity", label: "Total Equity", format: money },
        { key: "unitTransfer", label: "Annual Unit Transfer", format: money },
        { key: "shareTransfer", label: "Annual Share Transfer %", format: pct },
        { key: "recognizedTransfer", label: "Annual Recognized Transfer %", format: pct },
        { key: "closing", label: "Closing Balance", format: money },
        { key: "ownershipEnd", label: "Ownership % (End)", format: pct },
        { key: "recognizedEnd", label: "Recognized Ownership % (End)", format: pct },
        { key: "ltt", label: "LTT Trigger?", className: (r) => (r.ltt.includes("⚠") ? "warn" : "") }
    ];
    const annualColumnsCompact = [
        { key: "year", label: "Year" },
        { key: "startMonth", label: "Start" },
        { key: "endMonth", label: "End" },
        { key: "payment", label: "Annual Payment", format: money },
        { key: "profit", label: "Annual Profit", format: money },
        { key: "totalEquity", label: "Total Equity", format: money },
        { key: "closing", label: "Closing Balance", format: money },
        { key: "ownershipEnd", label: "Ownership %", format: pct },
        { key: "recognizedEnd", label: "Recognized %", format: pct },
        { key: "ltt", label: "LTT", className: (r) => (r.ltt.includes("⚠") ? "warn" : "") }
    ];
    renderTable("annualTable", showDetailAnnual ? annualColumnsDetailed : annualColumnsCompact, model.annualRows.map((r) => ({ ...r, opening: round2(r.opening), payment: round2(r.payment), prepay: round2(r.prepay), profit: round2(r.profit), equityRegular: round2(r.equityRegular), equityPrepay: round2(r.equityPrepay), totalEquity: round2(r.totalEquity), unitTransfer: round2(r.unitTransfer), closing: round2(r.closing) })));

    const saleColumnsDetailed = [
        { key: "year", label: "Year" },
        { key: "saleMonth", label: "Sale Month" },
        { key: "estimatedSalePrice", label: "Estimated Sale Price", format: money },
        { key: "totalSellingCosts", label: "Total Selling Costs", format: money },
        { key: "netBeforeSplit", label: "Net Sale Before Split", format: money },
        { key: "annualShareTransfer", label: "Annual Share Transfer %", format: pct },
        { key: "ownershipEnd", label: "Ownership %", format: pct },
        { key: "annualEquityRegular", label: "Annual Equity (Regular)", format: money },
        { key: "annualEquityPrepay", label: "Annual Equity (Prepay)", format: money },
        { key: "annualTotalEquity", label: "Total Equity", format: money },
        { key: "yourShare", label: "Your Share (Waterfall)", format: money },
        { key: "cumulativeTotalPaid", label: "Cumulative Total Paid", format: money },
        { key: "cumulativeProfitPaid", label: "Cumulative Profit Paid", format: money },
        { key: "totalCashInvested", label: "Total Cash Invested", format: money },
        { key: "netGainWaterfall", label: "Net Gain/Loss (Waterfall)", format: money },
        { key: "recognizedEnd", label: "Recognized Ownership %", format: pct },
        { key: "annualRecognizedTransfer", label: "Annual Recognized Transfer %", format: pct },
        { key: "roiWaterfall", label: "ROI (Waterfall)", format: pct },
        { key: "remainingBalance", label: "Remaining Balance (Payoff)", format: money },
        { key: "netCashPayoff", label: "Net Cash at Sale (Payoff)", format: money },
        { key: "netGainPayoff", label: "Net Gain/Loss (Payoff)", format: money },
        { key: "roiPayoff", label: "ROI (Payoff)", format: pct }
    ];
    const saleColumnsCompact = [
        { key: "year", label: "Year" },
        { key: "saleMonth", label: "Sale Month" },
        { key: "annualTotalEquity", label: "Total Equity", format: money },
        { key: "annualShareTransfer", label: "Share Transfer %", format: pct },
        { key: "estimatedSalePrice", label: "Est. Sale Price", format: money },
        { key: "totalSellingCosts", label: "Selling Costs", format: money },
        { key: "ownershipEnd", label: "Ownership %", format: pct },
        { key: "yourShare", label: "Your Share", format: money },
        { key: "cumulativeTotalPaid", label: "Cumulative Total Paid", format: money },
        { key: "cumulativeProfitPaid", label: "Cumulative Profit Paid", format: money },
        { key: "totalCashInvested", label: "Cash Invested", format: money },
        { key: "netGainWaterfall", label: "Net Gain (Waterfall)", format: money },
        { key: "roiWaterfall", label: "ROI (Waterfall)", format: pct }
    ];
    renderTable("saleTable", showDetailSale ? saleColumnsDetailed : saleColumnsCompact, model.saleRows.map((r) => ({
        ...r,
        annualEquityRegular: round2(r.annualEquityRegular), annualEquityPrepay: round2(r.annualEquityPrepay),
        annualTotalEquity: round2(r.annualTotalEquity),
        estimatedSalePrice: round2(r.estimatedSalePrice), totalSellingCosts: round2(r.totalSellingCosts), netBeforeSplit: round2(r.netBeforeSplit),
        yourShare: round2(r.yourShare), cumulativeTotalPaid: round2(r.cumulativeTotalPaid), cumulativeProfitPaid: round2(r.cumulativeProfitPaid),
        totalCashInvested: round2(r.totalCashInvested), netGainWaterfall: round2(r.netGainWaterfall), remainingBalance: round2(r.remainingBalance),
        netCashPayoff: round2(r.netCashPayoff), netGainPayoff: round2(r.netGainPayoff)
    })));

    const rentVsColumnsDetailed = [
        { key: "horizon", label: "Horizon" },
        { key: "betterOption", label: "Better Option", className: (r) => (r.betterOption === "Musharaka" ? "better-mush-text" : "better-rent-text") },
        { key: "betterBy", label: "Advantage", format: money },
        { key: "roiMusharaka", label: "ROI (Musharaka)", format: pct },
        { key: "totalOutOfPocketRent", label: "Total Cost (Rent)", format: money, className: (r) => (r.betterOption === "Rent" ? "better-rent-cell" : "") },
        { key: "totalOutOfPocketMusharaka", label: "Total Cost (Musharaka)", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "effectiveRentCost", label: "Effective Cost (Rent)", format: money, className: (r) => (r.betterOption === "Rent" ? "better-rent-cell" : "") },
        { key: "effectiveMusharakaCostWaterfall", label: "Effective Cost (Musharaka - Waterfall)", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "estimatedSalePrice", label: "Est. Sale Price", format: money },
        { key: "recognizedOwnership", label: "Recognized Ownership %", format: pct },
        { key: "rentMonthlyOutflow", label: "Rent Monthly Outflow", format: money },
        { key: "musharakaMonthlyOutflow", label: "Musharaka Monthly Outflow", format: money },
        { key: "upfrontRent", label: "Upfront Cash (Rent)", format: money },
        { key: "upfrontMusharaka", label: "Upfront Cash (Musharaka)", format: money },
        { key: "cumulativeEquityRegular", label: "Equity (Regular)", format: money },
        { key: "cumulativeEquityPrepay", label: "Equity (Prepay)", format: money },
        { key: "totalEquity", label: "Total Equity", format: money },
        { key: "annualUnitTransfer", label: "Annual Unit Transfer", format: money },
        { key: "annualShareTransfer", label: "Annual Share Transfer %", format: pct },
        { key: "cumulativeShareTransfer", label: "Cumulative Share Transfer %", format: pct },
        { key: "totalSellingCosts", label: "Selling Costs", format: money },
        { key: "netSaleBeforeSplit", label: "Net Sale Before Split", format: money },
        { key: "remainingBalance", label: "Remaining Balance", format: money }
    ];
    const rentVsColumnsCompact = [
        { key: "horizon", label: "Horizon" },
        { key: "betterOption", label: "Better Option", className: (r) => (r.betterOption === "Musharaka" ? "better-mush-text" : "better-rent-text") },
        { key: "betterBy", label: "Advantage", format: money },
        { key: "roiMusharaka", label: "ROI (Musharaka)", format: pct },
        { key: "totalOutOfPocketRent", label: "Total Cost (Rent)", format: money, className: (r) => (r.betterOption === "Rent" ? "better-rent-cell" : "") },
        { key: "totalOutOfPocketMusharaka", label: "Total Cost (Musharaka)", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "effectiveRentCost", label: "Effective Cost (Rent)", format: money, className: (r) => (r.betterOption === "Rent" ? "better-rent-cell" : "") },
        { key: "effectiveMusharakaCostWaterfall", label: "Effective Cost (Musharaka - Waterfall)", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "estimatedSalePrice", label: "Est. Sale Price", format: money },
        { key: "recognizedOwnership", label: "Recognized Ownership %", format: pct },
        { key: "rentMonthlyOutflow", label: "Rent Monthly", format: money },
        { key: "musharakaMonthlyOutflow", label: "Musharaka Monthly", format: money },
        { key: "upfrontRent", label: "Upfront Rent", format: money },
        { key: "upfrontMusharaka", label: "Upfront Musharaka", format: money },
        { key: "annualShareTransfer", label: "Annual Share Transfer %", format: pct },
        { key: "cumulativeShareTransfer", label: "Cumulative Share Transfer %", format: pct }
    ];
    const rentVsRows = buildRentVsRows(model).map((r) => ({
        ...r,
        rentMonthlyOutflow: round2(r.rentMonthlyOutflow),
        musharakaMonthlyOutflow: round2(r.musharakaMonthlyOutflow),
        upfrontRent: round2(r.upfrontRent),
        upfrontMusharaka: round2(r.upfrontMusharaka),
        cumulativeEquityRegular: round2(r.cumulativeEquityRegular),
        cumulativeEquityPrepay: round2(r.cumulativeEquityPrepay),
        totalEquity: round2(r.totalEquity),
        annualUnitTransfer: round2(r.annualUnitTransfer),
        totalOutOfPocketRent: round2(r.totalOutOfPocketRent),
        totalOutOfPocketMusharaka: round2(r.totalOutOfPocketMusharaka),
        effectiveRentCost: round2(r.effectiveRentCost),
        effectiveMusharakaCostWaterfall: round2(r.effectiveMusharakaCostWaterfall),
        netPosition: round2(r.netPosition),
        roiMusharaka: r.roiMusharaka,
        roiRent: r.roiRent,
        betterBy: round2(r.betterBy),
        estimatedSalePrice: round2(r.estimatedSalePrice),
        totalSellingCosts: round2(r.totalSellingCosts),
        netSaleBeforeSplit: round2(r.netSaleBeforeSplit),
        remainingBalance: round2(r.remainingBalance),
        netGainPayoff: round2(r.netGainPayoff),
        netSaleLow: round2(r.netSaleLow),
        netSaleBase: round2(r.netSaleBase),
        netSaleHigh: round2(r.netSaleHigh),
        rentOutLow: round2(r.rentOutLow),
        rentOutBase: round2(r.rentOutBase),
        rentOutHigh: round2(r.rentOutHigh)
    }));
    renderTable("rentVsTable", showDetailRentVs ? rentVsColumnsDetailed : rentVsColumnsCompact, rentVsRows);

    const convVsColumnsDetailed = [
        { key: "horizon", label: "Horizon" },
        { key: "betterOption", label: "Better Option", className: (r) => (r.betterOption === "Musharaka" ? "better-mush-text" : "better-rent-text") },
        { key: "betterBy", label: "Advantage", format: money },
        { key: "monthlyOutflowMush", label: "Monthly Outflow (Musharaka)", format: money },
        { key: "monthlyOutflowConv", label: "Monthly Outflow (Conventional)", format: money },
        { key: "upfrontMusharaka", label: "Upfront Cash (Musharaka)", format: money },
        { key: "upfrontConventional", label: "Upfront Cash (Conventional)", format: money },
        { key: "annualPrincipalMush", label: "Annual Principal/Equity (Musharaka)", format: money },
        { key: "annualPrincipalConv", label: "Annual Principal (Conventional)", format: money },
        { key: "annualShareTransferMush", label: "Annual Share Transfer % (Musharaka)", format: pct },
        { key: "annualShareTransferConv", label: "Annual Share Transfer % (Conventional)", format: pct },
        { key: "recognizedOwnershipMush", label: "Recognized Ownership % (Musharaka)", format: pct },
        { key: "equityShareConv", label: "Equity Share % (Conventional)", format: pct },
        { key: "totalOutOfPocketMush", label: "Total Out-of-Pocket (Musharaka)", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "totalOutOfPocketConv", label: "Total Out-of-Pocket (Conventional)", format: money, className: (r) => (r.betterOption === "Conventional" ? "better-rent-cell" : "") },
        { key: "estimatedSalePrice", label: "Estimated Sale Price", format: money },
        { key: "totalSellingCosts", label: "Total Selling Costs", format: money },
        { key: "netSaleBeforeSplit", label: "Net Sale Before Split", format: money },
        { key: "remainingBalanceMush", label: "Remaining Balance (Musharaka)", format: money },
        { key: "remainingBalanceConv", label: "Remaining Balance (Conventional)", format: money },
        { key: "effectiveCostMush", label: "Effective Cost (Musharaka - Waterfall)", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "effectiveCostConv", label: "Effective Cost (Conventional)", format: money, className: (r) => (r.betterOption === "Conventional" ? "better-rent-cell" : "") }
    ];
    const convVsColumnsCompact = [
        { key: "horizon", label: "Horizon" },
        { key: "betterOption", label: "Better", className: (r) => (r.betterOption === "Musharaka" ? "better-mush-text" : "better-rent-text") },
        { key: "betterBy", label: "Advantage", format: money },
        { key: "monthlyOutflowMush", label: "Mush Monthly", format: money },
        { key: "monthlyOutflowConv", label: "Conv Monthly", format: money },
        { key: "upfrontMusharaka", label: "Mush Upfront", format: money },
        { key: "upfrontConventional", label: "Conv Upfront", format: money },
        { key: "annualShareTransferMush", label: "Mush Transfer %", format: pct },
        { key: "annualShareTransferConv", label: "Conv Transfer %", format: pct },
        { key: "effectiveCostMush", label: "Mush Effective Cost", format: money, className: (r) => (r.betterOption === "Musharaka" ? "better-mush-cell" : "") },
        { key: "effectiveCostConv", label: "Conv Effective Cost", format: money, className: (r) => (r.betterOption === "Conventional" ? "better-rent-cell" : "") }
    ];
    const convVsRows = buildConvVsRows(model).map((r) => ({
        ...r,
        betterBy: round2(r.betterBy),
        monthlyOutflowMush: round2(r.monthlyOutflowMush),
        monthlyOutflowConv: round2(r.monthlyOutflowConv),
        upfrontMusharaka: round2(r.upfrontMusharaka),
        upfrontConventional: round2(r.upfrontConventional),
        annualPrincipalMush: round2(r.annualPrincipalMush),
        annualPrincipalConv: round2(r.annualPrincipalConv),
        totalPrincipalMush: round2(r.totalPrincipalMush),
        totalPrincipalConv: round2(r.totalPrincipalConv),
        totalOutOfPocketMush: round2(r.totalOutOfPocketMush),
        totalOutOfPocketConv: round2(r.totalOutOfPocketConv),
        estimatedSalePrice: round2(r.estimatedSalePrice),
        totalSellingCosts: round2(r.totalSellingCosts),
        netSaleBeforeSplit: round2(r.netSaleBeforeSplit),
        remainingBalanceMush: round2(r.remainingBalanceMush),
        remainingBalanceConv: round2(r.remainingBalanceConv),
        netCashAtSaleConv: round2(r.netCashAtSaleConv),
        effectiveCostMush: round2(r.effectiveCostMush),
        effectiveCostConv: round2(r.effectiveCostConv)
    }));
    renderTable("convVsTable", showDetailConvVs ? convVsColumnsDetailed : convVsColumnsCompact, convVsRows);
}

function setupTabs() {
    const buttons = Array.from(document.querySelectorAll(".tab-btn"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));
    for (const btn of buttons) {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            for (const b of buttons) {
                b.classList.toggle("active", b === btn);
                b.setAttribute("aria-selected", b === btn ? "true" : "false");
            }
            for (const panel of panels) {
                panel.classList.toggle("active", panel.id === target);
            }
        });
    }
}

document.getElementById("runBtn").addEventListener("click", render);
setupTabs();
document.getElementById("showDetailQuarterly")?.addEventListener("change", render);
document.getElementById("showDetailAnnual")?.addEventListener("change", render);
document.getElementById("showDetailSale")?.addEventListener("change", render);
document.getElementById("showDetailRentVs")?.addEventListener("change", render);
document.getElementById("showDetailConvVs")?.addEventListener("change", render);
[
    "monthlyRent",
    "tenantInsuranceMonthly",
    "utilitiesMonthly",
    "annualRentGrowthRate",
    "rentDeposit",
    "movingCosts",
    "propertyTaxMonthly",
    "homeInsuranceMonthly",
    "musharakaUtilitiesMonthly",
    "maintenanceMonthly",
    "sensitivityDeltaPct",
    "convMortgageAmount",
    "convInitialRate",
    "convAmortMonths",
    "convLenderFees",
    "convLegalFeesClosing",
    "convAppraisalFees",
    "convInsurancePremium",
    "convOtherClosingCosts"
].forEach((id) => document.getElementById(id)?.addEventListener("input", render));
document.getElementById("convResetSchedule")?.addEventListener("input", render);
document.getElementById("convPrepaymentSchedule")?.addEventListener("input", render);
render();
