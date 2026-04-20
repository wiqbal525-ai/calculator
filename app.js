const defaultInputs = {
    purchasePrice: 700000,
    downPayment: 200000,
    profitRateAnnual: 6.75,
    termYears: 25,
    propertyTaxMonthly: 350,
    monthlyCondoFee: 0,
    qualificationRatio: 30,
    monthlyPrepayment: 0,
};

const currencyFormatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-CA', {
    maximumFractionDigits: 0,
});

const form = document.querySelector('#calculatorForm');
const conventionalComparisonForm = document.querySelector('#conventionalComparisonForm');
const rentComparisonForm = document.querySelector('#rentComparisonForm');
const scheduleBody = document.querySelector('#scheduleBody');
const resetDefaultsButton = document.querySelector('#resetDefaultsButton');
const scheduleTableWrap = document.querySelector('#scheduleTableWrap');
const scheduleTable = document.querySelector('#scheduleTable');
const scheduleTableHead = document.querySelector('#scheduleTableHead');
const stickyScheduleHeader = document.querySelector('#stickyScheduleHeader');
const scheduleSectionTitle = document.querySelector('#scheduleSectionTitle');
const scheduleSectionNote = document.querySelector('#scheduleSectionNote');
const scheduleViewButtons = Array.from(document.querySelectorAll('[data-schedule-view]'));
const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const explanationSearchInput = document.querySelector('#calculationQuestionSearch');
const explanationTopicList = document.querySelector('#explanationTopicList');
const explanationTabLabel = document.querySelector('#explanationTabLabel');
const explanationTitle = document.querySelector('#explanationTitle');
const explanationLead = document.querySelector('#explanationLead');
const explanationFormula = document.querySelector('#explanationFormula');
const explanationCurrent = document.querySelector('#explanationCurrent');
const explanationWhy = document.querySelector('#explanationWhy');
const explainerPanel = document.querySelector('.explainer-panel');
const explanationModal = document.querySelector('#explanationModal');
const closeExplanationModalButton = document.querySelector('#closeExplanationModalButton');
const modalExplanationTabLabel = document.querySelector('#modalExplanationTabLabel');
const modalExplanationTitle = document.querySelector('#modalExplanationTitle');
const modalExplanationLead = document.querySelector('#modalExplanationLead');
const modalExplanationFormula = document.querySelector('#modalExplanationFormula');
const modalExplanationCurrent = document.querySelector('#modalExplanationCurrent');
const modalExplanationWhy = document.querySelector('#modalExplanationWhy');

const outputElements = {
    monthlyPayment: document.querySelector('#monthlyPaymentValue'),
    stressTestedPayment: document.querySelector('#stressTestedPaymentValue'),
    propertyTax: document.querySelector('#propertyTaxValue'),
    condoFee: document.querySelector('#condoFeeValue'),
    qualifyingHousingCost: document.querySelector('#qualifyingHousingCostValue'),
    requiredMonthlyIncome: document.querySelector('#requiredMonthlyIncomeValue'),
    requiredAnnualIncome: document.querySelector('#requiredAnnualIncomeValue'),
    incomeMultiple: document.querySelector('#incomeMultipleValue'),
    financingAmount: document.querySelector('#financingAmountValue'),
    termMonths: document.querySelector('#termMonthsValue'),
    finalBalance: document.querySelector('#finalBalanceValue'),
    finalOwnership: document.querySelector('#finalOwnershipValue'),
    totalSharePurchased: document.querySelector('#totalSharePurchasedValue'),
    latestQuarterTransfer: document.querySelector('#latestQuarterTransferValue'),
    validationMessage: document.querySelector('#validationMessage'),
    compareMusharakaPayment: document.querySelector('#compareMusharakaPaymentValue'),
    compareMusharakaCost: document.querySelector('#compareMusharakaCostValue'),
    compareConventionalPayment: document.querySelector('#compareConventionalPaymentValue'),
    compareConventionalCost: document.querySelector('#compareConventionalCostValue'),
    comparePaymentGap: document.querySelector('#comparePaymentGapValue'),
    compareFiveYearBalanceGap: document.querySelector('#compareFiveYearBalanceGapValue'),
    compareFiveYearEquityGap: document.querySelector('#compareFiveYearEquityGapValue'),
    comparePayoffGap: document.querySelector('#comparePayoffGapValue'),
    rentComparisonModeNote: document.querySelector('#rentComparisonModeNote'),
    rentOwnerMonthlyOutflow: document.querySelector('#rentOwnerMonthlyOutflowValue'),
    rentMonthlyRenterOutflow: document.querySelector('#rentMonthlyRenterOutflowValue'),
    rentMonthlyGap: document.querySelector('#rentMonthlyGapValue'),
    rentMetricOneLabel: document.querySelector('#rentMetricOneLabel'),
    rentMetricOneValue: document.querySelector('#rentMetricOneValue'),
    rentMetricOneMeta: document.querySelector('#rentMetricOneMeta'),
    rentMetricTwoLabel: document.querySelector('#rentMetricTwoLabel'),
    rentMetricTwoValue: document.querySelector('#rentMetricTwoValue'),
    rentMetricTwoMeta: document.querySelector('#rentMetricTwoMeta'),
    rentMetricThreeLabel: document.querySelector('#rentMetricThreeLabel'),
    rentMetricThreeValue: document.querySelector('#rentMetricThreeValue'),
    rentMetricThreeMeta: document.querySelector('#rentMetricThreeMeta'),
    rentVerdictModeNote: document.querySelector('#rentVerdictModeNote'),
    rentVerdictWindow: document.querySelector('#rentVerdictWindowValue'),
    rentVerdictHeadline: document.querySelector('#rentVerdictHeadlineValue'),
    rentVerdictSummary: document.querySelector('#rentVerdictSummaryValue'),
    rentVerdictGap: document.querySelector('#rentVerdictGapValue'),
    rentVerdictReasonOneLabel: document.querySelector('#rentVerdictReasonOneLabel'),
    rentVerdictReasonOneValue: document.querySelector('#rentVerdictReasonOneValue'),
    rentVerdictReasonOneNote: document.querySelector('#rentVerdictReasonOneNote'),
    rentVerdictReasonTwoLabel: document.querySelector('#rentVerdictReasonTwoLabel'),
    rentVerdictReasonTwoValue: document.querySelector('#rentVerdictReasonTwoValue'),
    rentVerdictReasonTwoNote: document.querySelector('#rentVerdictReasonTwoNote'),
    rentVerdictReasonThreeLabel: document.querySelector('#rentVerdictReasonThreeLabel'),
    rentVerdictReasonThreeValue: document.querySelector('#rentVerdictReasonThreeValue'),
    rentVerdictReasonThreeNote: document.querySelector('#rentVerdictReasonThreeNote'),
    rentTableModeNote: document.querySelector('#rentTableModeNote'),
};
const comparisonBody = document.querySelector('#comparisonBody');
const rentComparisonBody = document.querySelector('#rentComparisonBody');
const rentComparisonHeadRow = document.querySelector('#rentComparisonHeadRow');
const tabLabels = {
    calculator: 'Musharaka Calculator',
    'conventional-comparison': 'Musharaka vs Conventional',
    'rent-comparison': 'Musharaka vs Rent Toronto',
};
const explanationState = {
    activeTab: 'calculator',
    selectedTopicId: null,
    filter: '',
};
const scheduleViewState = {
    current: 'monthly',
};
let latestExplanationContext = null;

function pmt(periodicRate, periods, presentValue) {
    if (periods <= 0) {
        return 0;
    }

    if (periodicRate === 0) {
        return presentValue / periods;
    }

    return (periodicRate * presentValue) / (1 - Math.pow(1 + periodicRate, -periods));
}

function clampCurrency(value) {
    return Math.max(0, Math.round((value + Number.EPSILON) * 100) / 100);
}

function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatPercentValue(value, digits = 2) {
    return `${(value * 100).toFixed(digits)}%`;
}

function formatSignedCurrency(value) {
    if (value > 0) {
        return `+${currencyFormatter.format(value)}`;
    }

    if (value < 0) {
        return `-${currencyFormatter.format(Math.abs(value))}`;
    }

    return currencyFormatter.format(0);
}

function formatSignedPercent(value) {
    if (value > 0) {
        return `+${percentFormatter.format(value)}`;
    }

    if (value < 0) {
        return `-${percentFormatter.format(Math.abs(value))}`;
    }

    return percentFormatter.format(0);
}

function readInputs() {
    const raw = new FormData(form);
    const inputValues = Object.fromEntries(
        Array.from(raw.entries()).map(([key, value]) => [key, Number(value)])
    );

    return {
        purchasePrice: Math.max(0, inputValues.purchasePrice),
        downPayment: Math.max(0, inputValues.downPayment),
        profitRateAnnual: Math.max(0, inputValues.profitRateAnnual) / 100,
        termYears: Math.max(1, Math.round(inputValues.termYears || 1)),
        propertyTaxMonthly: Math.max(0, inputValues.propertyTaxMonthly),
        monthlyCondoFee: Math.max(0, inputValues.monthlyCondoFee),
        qualificationRatio: Math.max(0.01, inputValues.qualificationRatio / 100),
        monthlyPrepayment: Math.max(0, inputValues.monthlyPrepayment),
    };
}

function readConventionalInputs() {
    const raw = new FormData(conventionalComparisonForm);
    const inputValues = Object.fromEntries(
        Array.from(raw.entries()).map(([key, value]) => [key, Number(value)])
    );

    return {
        purchasePrice: Math.max(0, inputValues.comparePurchasePrice),
        downPayment: Math.max(0, inputValues.compareDownPayment),
        profitRateAnnual: Math.max(0, inputValues.compareProfitRateAnnual) / 100,
        conventionalRateAnnual: Math.max(0, inputValues.conventionalRateAnnual) / 100,
        termYears: Math.max(1, Math.round(inputValues.compareTermYears || 1)),
        propertyTaxMonthly: 0,
        qualificationRatio: 0.30,
        monthlyPrepayment: Math.max(0, inputValues.compareMonthlyPrepayment),
    };
}

function readRentInputs() {
    const raw = new FormData(rentComparisonForm);
    const inputValues = Object.fromEntries(
        Array.from(raw.entries()).map(([key, value]) => [key, Number(value)])
    );

    return {
        comparisonMode: raw.get('comparisonMode') || 'cash',
        purchasePrice: Math.max(0, inputValues.rentPurchasePrice),
        downPayment: Math.max(0, inputValues.rentDownPayment),
        profitRateAnnual: Math.max(0, inputValues.rentProfitRateAnnual) / 100,
        termYears: Math.max(1, Math.round(inputValues.rentTermYears || 1)),
        propertyTaxMonthly: Math.max(0, inputValues.rentPropertyTaxMonthly),
        monthlyCondoFees: Math.max(0, inputValues.rentMonthlyCondoFees),
        monthlyUtilities: Math.max(0, inputValues.rentMonthlyUtilities),
        monthlyHomeInsurance: Math.max(0, inputValues.rentMonthlyHomeInsurance),
        monthlyPrepayment: Math.max(0, inputValues.rentMonthlyPrepayment),
        startingMonthlyRent: Math.max(0, inputValues.startingMonthlyRent),
        annualRentIncrease: Math.max(0, inputValues.annualRentIncrease) / 100,
        monthlyRenterInsurance: Math.max(0, inputValues.rentMonthlyRenterInsurance),
        movingCostOneTime: Math.max(0, inputValues.rentMovingCostOneTime),
        maintenanceRateAnnual: Math.max(0, inputValues.maintenanceRateAnnual) / 100,
        homeAppreciationAnnual: Math.max(0, inputValues.homeAppreciationAnnual) / 100,
        renterReturnAnnual: Math.max(0, inputValues.renterReturnAnnual) / 100,
        comparisonHorizonYears: Math.max(1, Math.round(inputValues.comparisonHorizonYears || 1)),
    };
}

function buildRentTabInputs(rentInputs) {
    return {
        purchasePrice: rentInputs.purchasePrice,
        downPayment: rentInputs.downPayment,
        profitRateAnnual: rentInputs.profitRateAnnual,
        conventionalRateAnnual: 0,
        termYears: rentInputs.termYears,
        propertyTaxMonthly: rentInputs.propertyTaxMonthly,
        qualificationRatio: 0.30,
        monthlyPrepayment: rentInputs.monthlyPrepayment,
    };
}

function buildConventionalSchedule(inputs, financingAmount, termMonths) {
    const purchasePriceBase = Math.max(inputs.purchasePrice, 1);
    const monthlyRate = inputs.conventionalRateAnnual / 12;
    const monthlyPayment = clampCurrency(pmt(monthlyRate, termMonths, financingAmount));
    let beginningBalance = financingAmount;
    let cumulativeInterestCost = 0;
    let totalPrincipalPaid = 0;
    const schedule = [];

    for (let period = 1; period <= termMonths; period += 1) {
        if (beginningBalance <= 0) {
            break;
        }

        const interestPayment = clampCurrency(beginningBalance * monthlyRate);
        const scheduledPrincipal = clampCurrency(monthlyPayment - interestPayment);
        const remainingAfterScheduled = clampCurrency(beginningBalance - scheduledPrincipal);
        const appliedPrepayment = clampCurrency(Math.min(inputs.monthlyPrepayment, remainingAfterScheduled));
        const endingBalance = clampCurrency(beginningBalance - scheduledPrincipal - appliedPrepayment);
        const principalPaid = clampCurrency(scheduledPrincipal + appliedPrepayment);

        cumulativeInterestCost = clampCurrency(cumulativeInterestCost + interestPayment);
        totalPrincipalPaid = clampCurrency(totalPrincipalPaid + principalPaid);

        schedule.push({
            period,
            beginningBalance,
            monthlyPayment,
            interestPayment,
            principalPaid,
            endingBalance,
            equityRatio: Math.min(1, (inputs.downPayment + totalPrincipalPaid) / purchasePriceBase),
            cumulativeInterestCost,
        });

        beginningBalance = endingBalance;
    }

    return {
        monthlyPayment,
        totalInterestCost: cumulativeInterestCost,
        finalBalance: schedule.length ? schedule[schedule.length - 1].endingBalance : financingAmount,
        payoffMonth: schedule.length,
        schedule,
    };
}

function buildSchedule(inputs) {
    const termMonths = inputs.termYears * 12;
    const purchasePriceBase = Math.max(inputs.purchasePrice, 1);
    const financingAmount = clampCurrency(inputs.purchasePrice - inputs.downPayment);
    const monthlyRate = inputs.profitRateAnnual / 12;
    const monthlyPayment = clampCurrency(pmt(monthlyRate, termMonths, financingAmount));
    const stressTestedPayment = clampCurrency(financingAmount / termMonths);

    let beginningBalance = financingAmount;
    let totalSharePurchased = 0;
    let totalMusharakaCost = 0;
    let latestQuarterTransfer = 0;
    const schedule = [];

    for (let period = 1; period <= termMonths; period += 1) {
        if (beginningBalance <= 0) {
            break;
        }

        const paymentTowardFundProfit = clampCurrency(beginningBalance * monthlyRate);
        const regularShareCost = clampCurrency(monthlyPayment - paymentTowardFundProfit);
        const remainingAfterRegularPayment = clampCurrency(beginningBalance - regularShareCost);
        const appliedPrepayment = clampCurrency(Math.min(inputs.monthlyPrepayment, remainingAfterRegularPayment));
        const endingBalance = clampCurrency(beginningBalance - regularShareCost - appliedPrepayment);
        const sharePurchasedThisMonth = clampCurrency(regularShareCost + appliedPrepayment);

        totalSharePurchased = clampCurrency(totalSharePurchased + sharePurchasedThisMonth);
        totalMusharakaCost = clampCurrency(totalMusharakaCost + paymentTowardFundProfit);

        const clientOwnership = Math.min(1, (inputs.downPayment + totalSharePurchased) / purchasePriceBase);

        schedule.push({
            period,
            beginningBalance,
            totalInstallment: monthlyPayment,
            paymentTowardFundProfit,
            paymentTowardShareCostPrice: regularShareCost,
            endingBalance,
            quarterlySalePrice: null,
            quarterlySalePriceTransfer: null,
            quarterlyShareTransfer: null,
            quarterlyUnitTransfer: null,
            annualTransfer: null,
            clientOwnership,
            prepayment: appliedPrepayment,
            sharePurchasedThisMonth,
            cumulativeFinancingCost: totalMusharakaCost,
        });

        beginningBalance = endingBalance;
    }

    for (let index = 0; index < schedule.length; index += 3) {
        const quarterRows = schedule.slice(index, index + 3);
        if (!quarterRows.length) {
            continue;
        }

        const quarterSharePurchased = quarterRows.reduce((sum, row) => sum + row.sharePurchasedThisMonth, 0);
        const quarterlySalePrice = clampCurrency(monthlyPayment * 3);
        const quarterlySalePriceTransfer = quarterlySalePrice > 0 ? quarterSharePurchased / quarterlySalePrice : 0;
        const quarterlyShareTransfer = quarterSharePurchased / purchasePriceBase;

        schedule[index].quarterlySalePrice = quarterlySalePrice;
        schedule[index].quarterlySalePriceTransfer = quarterlySalePriceTransfer;
        schedule[index].quarterlyShareTransfer = quarterlyShareTransfer;
        schedule[index].quarterlyUnitTransfer = Math.round(quarterSharePurchased);
        schedule[index].annualTransfer = quarterlyShareTransfer * 4;
        latestQuarterTransfer = quarterlyShareTransfer;
    }

    const qualifyingHousingCost = clampCurrency(stressTestedPayment + inputs.propertyTaxMonthly + inputs.monthlyCondoFee);
    const requiredMonthlyIncome = clampCurrency(qualifyingHousingCost / inputs.qualificationRatio);
    const requiredAnnualIncome = clampCurrency(requiredMonthlyIncome * 12);
    const incomeMultiple = 1 / inputs.qualificationRatio;
    const conventional = buildConventionalSchedule(inputs, financingAmount, termMonths);
    const comparisonTimeline = buildComparisonTimeline(schedule, conventional.schedule, inputs.termYears);

    return {
        financingAmount,
        termMonths,
        monthlyPayment,
        stressTestedPayment,
        qualifyingHousingCost,
        requiredMonthlyIncome,
        requiredAnnualIncome,
        incomeMultiple,
        propertyTaxMonthly: inputs.propertyTaxMonthly,
        monthlyCondoFee: inputs.monthlyCondoFee,
        latestQuarterTransfer,
        totalSharePurchased,
        totalMusharakaCost,
        finalBalance: schedule.length ? schedule[schedule.length - 1].endingBalance : financingAmount,
        finalOwnership: schedule.length ? schedule[schedule.length - 1].clientOwnership : inputs.downPayment / purchasePriceBase,
        schedule,
        conventional,
        comparisonTimeline,
    };
}

function buildComparisonTimeline(musharakaSchedule, conventionalSchedule, termYears) {
    const timeline = [];
    const maxYears = termYears;

    for (let year = 1; year <= maxYears; year += 1) {
        const monthIndex = Math.min(year * 12, Math.max(musharakaSchedule.length, conventionalSchedule.length)) - 1;
        const musharakaRow = musharakaSchedule[Math.min(monthIndex, musharakaSchedule.length - 1)] || musharakaSchedule[musharakaSchedule.length - 1];
        const conventionalRow = conventionalSchedule[Math.min(monthIndex, conventionalSchedule.length - 1)] || conventionalSchedule[conventionalSchedule.length - 1];

        if (!musharakaRow || !conventionalRow) {
            continue;
        }

        timeline.push({
            year,
            musharakaBalance: musharakaRow.endingBalance,
            musharakaOwnership: musharakaRow.clientOwnership,
            musharakaCumulativeCost: musharakaRow.cumulativeFinancingCost,
            conventionalBalance: conventionalRow.endingBalance,
            conventionalEquity: conventionalRow.equityRatio,
            conventionalCumulativeCost: conventionalRow.cumulativeInterestCost,
            costGap: conventionalRow.cumulativeInterestCost - musharakaRow.cumulativeFinancingCost,
            balanceGap: conventionalRow.endingBalance - musharakaRow.endingBalance,
            equityGap: musharakaRow.clientOwnership - conventionalRow.equityRatio,
        });
    }

    return timeline;
}

function buildRentComparison(inputs, musharakaResult, rentInputs) {
    const horizonMonths = Math.min(rentInputs.comparisonHorizonYears * 12, musharakaResult.termMonths);
    const maintenanceMonthlyBase = (inputs.purchasePrice * rentInputs.maintenanceRateAnnual) / 12;
    const monthlyHomeAppreciation = Math.pow(1 + rentInputs.homeAppreciationAnnual, 1 / 12) - 1;
    const monthlyRenterReturn = Math.pow(1 + rentInputs.renterReturnAnnual, 1 / 12) - 1;

    let currentRent = rentInputs.startingMonthlyRent;
    let currentHomeValue = inputs.purchasePrice;
    let renterPortfolio = roundCurrency(inputs.downPayment - rentInputs.movingCostOneTime);
    let ownerCumulativeOutflow = 0;
    let renterCumulativeOutflow = rentInputs.movingCostOneTime;
    const timeline = [];

    for (let month = 1; month <= horizonMonths; month += 1) {
        const scheduleRow = musharakaResult.schedule[Math.min(month - 1, musharakaResult.schedule.length - 1)];
        if (!scheduleRow) {
            break;
        }

        currentHomeValue = clampCurrency(currentHomeValue * (1 + monthlyHomeAppreciation));

        const ownerMonthlyOutflow = clampCurrency(
            scheduleRow.totalInstallment + scheduleRow.prepayment + inputs.propertyTaxMonthly + rentInputs.monthlyCondoFees + rentInputs.monthlyUtilities + rentInputs.monthlyHomeInsurance + maintenanceMonthlyBase
        );
        const renterMonthlyOutflow = clampCurrency(currentRent + rentInputs.monthlyRenterInsurance);
        const monthlyGap = roundCurrency(ownerMonthlyOutflow - renterMonthlyOutflow);

        ownerCumulativeOutflow = clampCurrency(ownerCumulativeOutflow + ownerMonthlyOutflow);
        renterCumulativeOutflow = clampCurrency(renterCumulativeOutflow + renterMonthlyOutflow);
        renterPortfolio = roundCurrency(renterPortfolio * (1 + monthlyRenterReturn) + monthlyGap);

        if (month % 12 === 0) {
            const ownerStakeValue = clampCurrency(scheduleRow.clientOwnership * currentHomeValue);
            timeline.push({
                year: month / 12,
                ownerMonthlyOutflow,
                ownerCumulativeOutflow,
                renterMonthlyOutflow,
                homeValue: currentHomeValue,
                ownerStakeValue,
                yearEndRent: currentRent,
                renterCumulativeOutflow,
                renterPortfolio,
                outflowGap: clampCurrency(ownerCumulativeOutflow - renterCumulativeOutflow),
                netWorthGap: roundCurrency(ownerStakeValue - renterPortfolio),
            });

            currentRent = clampCurrency(currentRent * (1 + rentInputs.annualRentIncrease));
        }
    }

    const horizonPoint = timeline[timeline.length - 1] || null;
    const tenYearPoint = timeline.find((row) => row.year === 10) || null;
    const currentOwnerMonthlyOutflow = musharakaResult.schedule.length
        ? clampCurrency(musharakaResult.schedule[0].totalInstallment + musharakaResult.schedule[0].prepayment + inputs.propertyTaxMonthly + rentInputs.monthlyCondoFees + rentInputs.monthlyUtilities + rentInputs.monthlyHomeInsurance + maintenanceMonthlyBase)
        : 0;
    const currentRenterMonthlyOutflow = clampCurrency(rentInputs.startingMonthlyRent + rentInputs.monthlyRenterInsurance);

    return {
        comparisonMode: rentInputs.comparisonMode,
        currentOwnerMonthlyOutflow,
        currentRenterMonthlyOutflow,
        currentRent: rentInputs.startingMonthlyRent,
        currentMonthlyGap: roundCurrency(currentOwnerMonthlyOutflow - currentRenterMonthlyOutflow),
        horizonPoint,
        tenYearPoint,
        timeline,
    };
}

function buildExplanationTopics(context) {
    const firstScheduleRow = context.result.schedule[0] || null;
    const firstQuarterRow = context.result.schedule.find((row) => row.quarterlyUnitTransfer !== null) || null;
    const conventionalFiveYearPoint = context.conventionalResult.comparisonTimeline[Math.min(4, context.conventionalResult.comparisonTimeline.length - 1)] || null;
    const rentVerdictPoint = context.rentComparison.tenYearPoint || context.rentComparison.horizonPoint || null;
    const isRentNetWorthMode = context.rentInputs.comparisonMode === 'networth';

    return [
        {
            id: 'monthly-payment',
            tab: 'calculator',
            title: 'How is the monthly payment calculated?',
            meta: 'Uses the financed amount, monthly profit rate, and total term.',
            keywords: 'monthly payment installment pmt financing amount profit rate term',
            formula: 'Monthly payment = PMT(profit rate / 12, term months, purchase price - down payment)',
            current: `Financing amount is ${currencyFormatter.format(context.result.financingAmount)}. Monthly profit rate is ${formatPercentValue(context.inputs.profitRateAnnual / 12, 4)} over ${numberFormatter.format(context.result.termMonths)} months, which gives ${currencyFormatter.format(context.result.monthlyPayment)}.`,
            why: 'It goes up when the financed amount or profit rate increases. It usually goes down when the down payment is larger or the term is longer.',
        },
        {
            id: 'stress-test',
            tab: 'calculator',
            title: 'How is the stress-tested payment calculated?',
            meta: 'This follows the screenshot logic instead of a second PMT formula.',
            keywords: 'stress test payment stress tested affordability qualification screenshot logic',
            formula: 'Stress-tested payment = financing amount / total months',
            current: `${currencyFormatter.format(context.result.financingAmount)} divided by ${numberFormatter.format(context.result.termMonths)} months = ${currencyFormatter.format(context.result.stressTestedPayment)}.`,
            why: 'It changes only when the financing amount or term changes. In this model it does not use a separate stress-test interest rate.',
        },
        {
            id: 'required-income',
            tab: 'calculator',
            title: 'How is the required income calculated?',
            meta: 'The qualifying monthly cost is divided by the qualification ratio.',
            keywords: 'required income annual income qualification ratio affordability property tax condo fee',
            formula: 'Required monthly income = (stress-tested payment + monthly property tax + monthly condo fee) / qualification ratio',
            current: `${currencyFormatter.format(context.result.stressTestedPayment)} + ${currencyFormatter.format(context.result.propertyTaxMonthly)} + ${currencyFormatter.format(context.result.monthlyCondoFee)} = ${currencyFormatter.format(context.result.qualifyingHousingCost)}. Dividing that by ${formatPercentValue(context.inputs.qualificationRatio)} gives ${currencyFormatter.format(context.result.requiredMonthlyIncome)} per month, or ${currencyFormatter.format(context.result.requiredAnnualIncome)} per year.`,
            why: 'A tighter qualification ratio raises the income requirement. Higher property tax or condo fees also raise it, even though they do not change the Musharaka financing schedule.',
        },
        {
            id: 'share-purchase',
            tab: 'calculator',
            title: 'How is the share purchase portion calculated?',
            meta: 'Each month the installment is split between profit and buying more ownership.',
            keywords: 'share purchase fund profit ownership prepayment principal',
            formula: 'Share purchase = total installment - payment towards fund profit; prepayment is added on top',
            current: firstScheduleRow
                ? `In month 1, total installment is ${currencyFormatter.format(firstScheduleRow.totalInstallment)} and payment towards fund profit is ${currencyFormatter.format(firstScheduleRow.paymentTowardFundProfit)}, so the scheduled share purchase is ${currencyFormatter.format(firstScheduleRow.paymentTowardShareCostPrice)}. Prepayment for that month is ${currencyFormatter.format(firstScheduleRow.prepayment)}.`
                : 'Add valid inputs to see the first monthly split.',
            why: 'As the fund balance shrinks, the profit portion usually falls and the share-purchase portion usually rises. Any prepayment reduces the balance faster.',
        },
        {
            id: 'quarterly-transfer',
            tab: 'calculator',
            title: 'How are the quarterly transfer values calculated?',
            meta: 'Quarterly transfer appears on period 1, 4, 7, and so on.',
            keywords: 'quarterly transfer annual transfer unit transfer sale price schedule',
            formula: 'Quarterly unit transfer = sum of 3 months of share purchases; quarterly share transfer % = quarterly unit transfer / purchase price; annual % transfer = quarterly share transfer % x 4',
            current: firstQuarterRow
                ? `For the first quarter block, the model sums three months of share purchases to get ${numberFormatter.format(firstQuarterRow.quarterlyUnitTransfer)}. That is ${percentFormatter.format(firstQuarterRow.quarterlyShareTransfer)} of the ${currencyFormatter.format(context.inputs.purchasePrice)} purchase price. Annual % transfer is shown as ${percentFormatter.format(firstQuarterRow.annualTransfer)}.`
                : 'Add valid inputs to see the first quarterly block.',
            why: 'These values move when monthly share purchases change. Higher rates reduce early share transfer, while higher prepayments increase it.',
        },
        {
            id: 'comparison-payment-gap',
            tab: 'conventional-comparison',
            title: 'How is the monthly payment gap calculated?',
            meta: 'Compares the Musharaka installment with the conventional mortgage payment.',
            keywords: 'payment gap conventional mortgage comparison monthly payment gap',
            formula: 'Payment gap = conventional monthly payment - Musharaka monthly payment',
            current: `${currencyFormatter.format(context.conventionalResult.conventional.monthlyPayment)} minus ${currencyFormatter.format(context.conventionalResult.monthlyPayment)} = ${formatSignedCurrency(context.conventionalResult.conventional.monthlyPayment - context.conventionalResult.monthlyPayment)}.`,
            why: 'The gap changes when either rate changes, or when purchase price, down payment, term, or prepayment assumptions change.',
        },
        {
            id: 'comparison-five-year-balance',
            tab: 'conventional-comparison',
            title: 'How is the 5-year balance gap calculated?',
            meta: 'Uses the balances after 60 months in both schedules.',
            keywords: '5 year balance gap remaining balance after 60 months',
            formula: '5-year balance gap = conventional balance after 60 months - Musharaka balance after 60 months',
            current: conventionalFiveYearPoint
                ? `${currencyFormatter.format(conventionalFiveYearPoint.conventionalBalance)} minus ${currencyFormatter.format(conventionalFiveYearPoint.musharakaBalance)} = ${formatSignedCurrency(conventionalFiveYearPoint.balanceGap)} after year 5.`
                : 'Set a term of at least 5 years to see the year-5 comparison.',
            why: 'This gap reflects how quickly each structure reduces the outstanding balance under the same purchase price, term, and prepayment assumptions.',
        },
        {
            id: 'comparison-total-cost',
            tab: 'conventional-comparison',
            title: 'How are total financing costs compared?',
            meta: 'Musharaka tracks cumulative fund profit while conventional tracks cumulative interest.',
            keywords: 'total cost cumulative cost interest profit financing cost',
            formula: 'Cost gap over time = conventional cumulative interest - Musharaka cumulative fund profit',
            current: `At full term, Musharaka cumulative fund profit is ${currencyFormatter.format(context.conventionalResult.totalMusharakaCost)} and conventional cumulative interest is ${currencyFormatter.format(context.conventionalResult.conventional.totalInterestCost)}.`,
            why: 'These totals respond to rate changes, the pace of principal reduction, and any prepayments that shorten the life of the financing.',
        },
        {
            id: 'rent-owner-outflow',
            tab: 'rent-comparison',
            title: 'How is the owner monthly outflow calculated?',
            meta: 'Adds all current housing cash costs on the ownership side.',
            keywords: 'owner monthly outflow rent comparison tax condo utilities insurance maintenance',
            formula: 'Owner outflow = installment + prepayment + property tax + condo fees + utilities + home insurance + monthly maintenance estimate',
            current: `${currencyFormatter.format(context.rentComparison.currentOwnerMonthlyOutflow)} is built from the first Musharaka installment plus ${currencyFormatter.format(context.rentInputs.propertyTaxMonthly)} property tax, ${currencyFormatter.format(context.rentInputs.monthlyCondoFees)} condo fees, ${currencyFormatter.format(context.rentInputs.monthlyUtilities)} utilities, ${currencyFormatter.format(context.rentInputs.monthlyHomeInsurance)} home insurance, and maintenance based on ${formatPercentValue(context.rentInputs.maintenanceRateAnnual)} of home value per year.`,
            why: 'This figure rises when ownership costs or maintenance assumptions rise. It also changes with the financing payment and any prepayment you add.',
        },
        {
            id: 'rent-gap',
            tab: 'rent-comparison',
            title: 'How is the monthly rent gap calculated?',
            meta: 'Compares current owner outflow against current renter outflow.',
            keywords: 'rent gap monthly gap renter outflow owner outflow',
            formula: 'Monthly gap = owner monthly outflow - renter monthly outflow',
            current: `${currencyFormatter.format(context.rentComparison.currentOwnerMonthlyOutflow)} minus ${currencyFormatter.format(context.rentComparison.currentRenterMonthlyOutflow)} = ${formatSignedCurrency(context.rentComparison.currentMonthlyGap)}.`,
            why: 'A positive value means owning costs more today. A negative value means renting costs more today.',
        },
        {
            id: 'rent-verdict',
            tab: 'rent-comparison',
            title: 'How is the 10-year verdict decided?',
            meta: 'The verdict changes based on whether the tab is in cash mode or net worth mode.',
            keywords: '10 year verdict cash outflow net worth rent comparison',
            formula: isRentNetWorthMode
                ? 'Net worth mode verdict = owner stake value - renter portfolio at the selected horizon'
                : 'Cash mode verdict = owner cumulative outflow - renter cumulative outflow at the selected horizon',
            current: rentVerdictPoint
                ? (isRentNetWorthMode
                    ? `At year ${numberFormatter.format(rentVerdictPoint.year)}, owner stake value is ${currencyFormatter.format(rentVerdictPoint.ownerStakeValue)} and renter portfolio is ${currencyFormatter.format(rentVerdictPoint.renterPortfolio)}, so the net worth gap is ${formatSignedCurrency(rentVerdictPoint.netWorthGap)}.`
                    : `At year ${numberFormatter.format(rentVerdictPoint.year)}, owner cumulative outflow is ${currencyFormatter.format(rentVerdictPoint.ownerCumulativeOutflow)} and renter cumulative outflow is ${currencyFormatter.format(rentVerdictPoint.renterCumulativeOutflow)}, so the cash outflow gap is ${formatSignedCurrency(rentVerdictPoint.outflowGap)}.`)
                : 'Increase the comparison horizon to see the verdict calculation.',
            why: isRentNetWorthMode
                ? 'Net worth mode is sensitive to home appreciation, renter return assumptions, ownership growth, and cash flow differences invested over time.'
                : 'Cash mode ignores asset growth and only compares how much cash each side has spent by the horizon.',
        },
    ];
}

function renderExplanationAnswer(topic) {
    explanationTabLabel.textContent = tabLabels[topic.tab] || '';
    explanationTitle.textContent = topic.title;
    explanationLead.textContent = topic.meta;
    explanationFormula.textContent = topic.formula;
    explanationCurrent.textContent = topic.current;
    explanationWhy.textContent = topic.why;
}

function renderModalExplanationAnswer(topic) {
    modalExplanationTabLabel.textContent = tabLabels[topic.tab] || '';
    modalExplanationTitle.textContent = topic.title;
    modalExplanationLead.textContent = topic.meta;
    modalExplanationFormula.textContent = topic.formula;
    modalExplanationCurrent.textContent = topic.current;
    modalExplanationWhy.textContent = topic.why;
}

function getExplanationTopic(topicId, tabName) {
    if (!latestExplanationContext) {
        return null;
    }

    const topics = buildExplanationTopics(latestExplanationContext);
    return topics.find((topic) => topic.id === topicId && (!tabName || topic.tab === tabName)) || null;
}

function openExplanationModal(topic) {
    if (!topic || !explanationModal) {
        return;
    }

    renderModalExplanationAnswer(topic);
    explanationModal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeExplanationModalButton?.focus();
}

function closeExplanationModal() {
    if (!explanationModal) {
        return;
    }

    explanationModal.hidden = true;
    document.body.style.overflow = '';
}

function openExplanationTopic(topicId, tabName) {
    explanationState.selectedTopicId = topicId;
    explanationState.filter = '';

    if (explanationSearchInput) {
        explanationSearchInput.value = '';
    }

    if (tabName && tabName !== explanationState.activeTab) {
        setActiveTab(tabName);
    } else {
        renderExplanationPanel();
    }

    openExplanationModal(getExplanationTopic(topicId, tabName || explanationState.activeTab));
}

function renderExplanationPanel() {
    if (!latestExplanationContext) {
        return;
    }

    const topics = buildExplanationTopics(latestExplanationContext);
    const terms = explanationState.filter.split(/\s+/).filter(Boolean);
    const visibleTopics = topics.filter((topic) => {
        if (topic.tab !== explanationState.activeTab) {
            return false;
        }

        if (!terms.length) {
            return true;
        }

        const haystack = `${topic.title} ${topic.meta} ${topic.keywords}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
    });

    if (!visibleTopics.some((topic) => topic.id === explanationState.selectedTopicId)) {
        explanationState.selectedTopicId = visibleTopics[0] ? visibleTopics[0].id : null;
    }

    if (!visibleTopics.length) {
        explanationTopicList.innerHTML = '<p class="explainer-empty">No matching questions for this tab yet. Try a simpler term like payment, income, transfer, or verdict.</p>';
        explanationTabLabel.textContent = tabLabels[explanationState.activeTab] || '';
        explanationTitle.textContent = 'No matching question found';
        explanationLead.textContent = 'Search results update per tab, so only topics relevant to the current calculator view are shown.';
        explanationFormula.textContent = '-';
        explanationCurrent.textContent = '-';
        explanationWhy.textContent = '-';
        return;
    }

    explanationTopicList.innerHTML = visibleTopics.map((topic) => `
        <button class="explainer-topic${topic.id === explanationState.selectedTopicId ? ' active' : ''}" type="button" data-topic-id="${topic.id}">
            <span class="explainer-topic-title">${topic.title}</span>
            <span class="explainer-topic-meta">${topic.meta}</span>
        </button>
    `).join('');

    explanationTopicList.querySelectorAll('[data-topic-id]').forEach((button) => {
        button.addEventListener('click', () => {
            explanationState.selectedTopicId = button.dataset.topicId;
            renderExplanationPanel();
        });
    });

    const selectedTopic = visibleTopics.find((topic) => topic.id === explanationState.selectedTopicId) || visibleTopics[0];
    explanationState.selectedTopicId = selectedTopic.id;
    renderExplanationAnswer(selectedTopic);
}

function renderSummary(result, inputs) {
    outputElements.monthlyPayment.textContent = currencyFormatter.format(result.monthlyPayment);
    outputElements.stressTestedPayment.textContent = currencyFormatter.format(result.stressTestedPayment);
    outputElements.propertyTax.textContent = currencyFormatter.format(result.propertyTaxMonthly);
    outputElements.condoFee.textContent = currencyFormatter.format(result.monthlyCondoFee);
    outputElements.qualifyingHousingCost.textContent = currencyFormatter.format(result.qualifyingHousingCost);
    outputElements.requiredMonthlyIncome.textContent = currencyFormatter.format(result.requiredMonthlyIncome);
    outputElements.requiredAnnualIncome.textContent = currencyFormatter.format(result.requiredAnnualIncome);
    outputElements.incomeMultiple.textContent = `${result.incomeMultiple.toFixed(2)}x`;
    outputElements.financingAmount.textContent = currencyFormatter.format(result.financingAmount);
    outputElements.termMonths.textContent = numberFormatter.format(result.termMonths);
    outputElements.finalBalance.textContent = currencyFormatter.format(result.finalBalance);
    outputElements.finalOwnership.textContent = percentFormatter.format(result.finalOwnership);
    outputElements.totalSharePurchased.textContent = currencyFormatter.format(result.totalSharePurchased);
    outputElements.latestQuarterTransfer.textContent = percentFormatter.format(result.latestQuarterTransfer || 0);
    renderRentComparison(result.rentComparison);

    const messages = [];
    let invalid = false;

    if (inputs.downPayment > inputs.purchasePrice) {
        invalid = true;
        messages.push('Down payment cannot be greater than purchase price.');
    }

    if (result.financingAmount <= 0) {
        invalid = true;
        messages.push('Financing amount must be greater than zero.');
    }

    if (result.schedule.length && result.schedule[0].paymentTowardShareCostPrice <= 0) {
        invalid = true;
        messages.push('Monthly payment is not large enough to cover the first month profit amount.');
    }

    if (!invalid) {
        messages.push('Affordability follows the screenshot logic, and quarterly transfer values are shown on the first period of each three-month block.');
    }

    outputElements.validationMessage.textContent = messages.join(' ');
    outputElements.validationMessage.classList.toggle('invalid', invalid);
}

function renderRentComparison(rentComparison) {
    const horizonPoint = rentComparison.horizonPoint;
    const verdictPoint = rentComparison.tenYearPoint || horizonPoint;
    const isNetWorthMode = rentComparison.comparisonMode === 'networth';

    outputElements.rentOwnerMonthlyOutflow.textContent = currencyFormatter.format(rentComparison.currentOwnerMonthlyOutflow);
    outputElements.rentMonthlyRenterOutflow.textContent = currencyFormatter.format(rentComparison.currentRenterMonthlyOutflow);
    outputElements.rentMonthlyGap.textContent = currencyFormatter.format(rentComparison.currentMonthlyGap);

    outputElements.rentComparisonModeNote.textContent = isNetWorthMode
        ? 'Net worth mode compares owner stake in the home against the renter portfolio, while still tracking cash spent on both sides.'
        : 'Cash mode compares only what each side spends over time. It ignores home value growth and renter investment growth.';

    if (isNetWorthMode) {
        outputElements.rentMetricOneLabel.textContent = 'Owner stake value';
        outputElements.rentMetricOneValue.textContent = horizonPoint ? currencyFormatter.format(horizonPoint.ownerStakeValue) : 'N/A';
        outputElements.rentMetricOneMeta.textContent = 'Client ownership percentage times the appreciated home value at the horizon.';
        outputElements.rentMetricTwoLabel.textContent = 'Renter portfolio';
        outputElements.rentMetricTwoValue.textContent = horizonPoint ? currencyFormatter.format(horizonPoint.renterPortfolio) : 'N/A';
        outputElements.rentMetricTwoMeta.textContent = 'Down payment less moving cost, plus the monthly savings difference invested over time.';
        outputElements.rentMetricThreeLabel.textContent = 'Net worth gap';
        outputElements.rentMetricThreeValue.textContent = horizonPoint ? currencyFormatter.format(horizonPoint.netWorthGap) : 'N/A';
        outputElements.rentMetricThreeMeta.textContent = 'Owner stake value minus renter portfolio value at the horizon.';
        outputElements.rentTableModeNote.textContent = 'Year-end snapshot of home value, owner stake, renter portfolio, and cumulative cash outflow under both paths.';
        renderRentComparisonHeadings([
            'Year',
            'Toronto Home Value',
            'Owner Stake Value',
            'Owner Cumulative Outflow',
            'Renter Portfolio',
            'Renter Cumulative Outflow',
            'Net Worth Gap',
        ]);
    } else {
        outputElements.rentMetricOneLabel.textContent = 'Owner cumulative outflow';
        outputElements.rentMetricOneValue.textContent = horizonPoint ? currencyFormatter.format(horizonPoint.ownerCumulativeOutflow) : 'N/A';
        outputElements.rentMetricOneMeta.textContent = 'Total cash spent by the owner by the comparison horizon.';
        outputElements.rentMetricTwoLabel.textContent = 'Renter cumulative outflow';
        outputElements.rentMetricTwoValue.textContent = horizonPoint ? currencyFormatter.format(horizonPoint.renterCumulativeOutflow) : 'N/A';
        outputElements.rentMetricTwoMeta.textContent = 'Total rent, renter insurance, and moving cost paid by the renter by the comparison horizon.';
        outputElements.rentMetricThreeLabel.textContent = 'Cumulative outflow gap';
        outputElements.rentMetricThreeValue.textContent = horizonPoint ? currencyFormatter.format(horizonPoint.outflowGap) : 'N/A';
        outputElements.rentMetricThreeMeta.textContent = 'Owner cumulative outflow minus renter cumulative outflow at the horizon.';
        outputElements.rentTableModeNote.textContent = 'Year-end snapshot of owner cash outflow, renter cash outflow, and the cumulative difference under both paths.';
        renderRentComparisonHeadings([
            'Year',
            'Owner Monthly Outflow',
            'Owner Cumulative Outflow',
            'Renter Monthly Outflow',
            'Renter Cumulative Outflow',
            'Cumulative Outflow Gap',
        ]);
    }

    renderRentVerdict(verdictPoint);

    const rows = rentComparison.timeline.map((row) => {
        if (isNetWorthMode) {
            return `
        <tr>
            <td>${numberFormatter.format(row.year)}</td>
            <td>${currencyFormatter.format(row.homeValue)}</td>
            <td>${currencyFormatter.format(row.ownerStakeValue)}</td>
            <td>${currencyFormatter.format(row.ownerCumulativeOutflow)}</td>
            <td>${currencyFormatter.format(row.renterPortfolio)}</td>
            <td>${currencyFormatter.format(row.renterCumulativeOutflow)}</td>
            <td>${currencyFormatter.format(row.netWorthGap)}</td>
        </tr>
    `;
        }

        return `
        <tr>
            <td>${numberFormatter.format(row.year)}</td>
            <td>${currencyFormatter.format(row.ownerMonthlyOutflow)}</td>
            <td>${currencyFormatter.format(row.ownerCumulativeOutflow)}</td>
            <td>${currencyFormatter.format(row.renterMonthlyOutflow)}</td>
            <td>${currencyFormatter.format(row.renterCumulativeOutflow)}</td>
            <td>${currencyFormatter.format(row.outflowGap)}</td>
        </tr>
    `;
    }).join('');

    rentComparisonBody.innerHTML = rows;
}

function renderRentComparisonHeadings(headings) {
    rentComparisonHeadRow.innerHTML = headings.map((heading) => `<th>${heading}</th>`).join('');
}

function renderRentVerdict(verdictPoint) {
    if (!verdictPoint) {
        outputElements.rentVerdictWindow.textContent = 'Comparison window unavailable';
        outputElements.rentVerdictHeadline.textContent = 'Add enough data to see a verdict';
        outputElements.rentVerdictSummary.textContent = 'Increase the comparison horizon to at least 1 year.';
        outputElements.rentVerdictGap.textContent = 'N/A';
        outputElements.rentVerdictModeNote.textContent = '';
        outputElements.rentVerdictReasonOneValue.textContent = 'N/A';
        outputElements.rentVerdictReasonOneNote.textContent = '';
        outputElements.rentVerdictReasonTwoValue.textContent = 'N/A';
        outputElements.rentVerdictReasonTwoNote.textContent = '';
        outputElements.rentVerdictReasonThreeValue.textContent = 'N/A';
        outputElements.rentVerdictReasonThreeNote.textContent = '';
        return;
    }

    const isNetWorthMode = verdictPoint.netWorthGap !== undefined && document.querySelector('input[name="comparisonMode"]:checked')?.value === 'networth';
    const windowLabel = verdictPoint.year >= 10 ? 'After 10 years' : `After ${verdictPoint.year} years`;

    outputElements.rentVerdictWindow.textContent = windowLabel;

    if (isNetWorthMode) {
        const ownerAhead = verdictPoint.netWorthGap >= 0;
        outputElements.rentVerdictModeNote.textContent = 'This verdict uses owner stake value versus the renter portfolio after 10 years, while still surfacing total cash spent.';
        outputElements.rentVerdictHeadline.textContent = ownerAhead
            ? 'Musharaka is ahead on net worth'
            : 'Renting is ahead on net worth';
        outputElements.rentVerdictSummary.textContent = ownerAhead
            ? 'The owner stake in the home is larger than the renter portfolio at this point.'
            : 'The renter portfolio has grown larger than the owner stake in the home at this point.';
        outputElements.rentVerdictGap.textContent = currencyFormatter.format(Math.abs(verdictPoint.netWorthGap));

        outputElements.rentVerdictReasonOneLabel.textContent = 'Owner stake value';
        outputElements.rentVerdictReasonOneValue.textContent = currencyFormatter.format(verdictPoint.ownerStakeValue);
        outputElements.rentVerdictReasonOneNote.textContent = `Based on the appreciated home value and Musharaka ownership percentage by year ${verdictPoint.year}.`;

        outputElements.rentVerdictReasonTwoLabel.textContent = 'Renter portfolio';
        outputElements.rentVerdictReasonTwoValue.textContent = currencyFormatter.format(verdictPoint.renterPortfolio);
        outputElements.rentVerdictReasonTwoNote.textContent = 'Built from the down payment less moving cost, plus the monthly savings difference invested over time.';

        outputElements.rentVerdictReasonThreeLabel.textContent = 'Cumulative cash outflow';
        outputElements.rentVerdictReasonThreeValue.textContent = currencyFormatter.format(Math.abs(verdictPoint.outflowGap));
        outputElements.rentVerdictReasonThreeNote.textContent = verdictPoint.outflowGap >= 0
            ? 'Ownership required this much more cumulative cash outflow than renting over the same period.'
            : 'Renting required this much more cumulative cash outflow than ownership over the same period.';
        return;
    }

    const rentingAhead = verdictPoint.outflowGap >= 0;
    outputElements.rentVerdictModeNote.textContent = 'This verdict uses cumulative cash spent only. It ignores home value growth and renter investment growth.';
    outputElements.rentVerdictHeadline.textContent = rentingAhead
        ? 'Renting requires less cash over this period'
        : 'Musharaka requires less cash over this period';
    outputElements.rentVerdictSummary.textContent = rentingAhead
        ? 'Cumulative rent paid stays below total owner cash outflow over the comparison window.'
        : 'Total owner cash outflow stays below cumulative rent paid over the comparison window.';
    outputElements.rentVerdictGap.textContent = currencyFormatter.format(Math.abs(verdictPoint.outflowGap));

    outputElements.rentVerdictReasonOneLabel.textContent = 'Owner cumulative outflow';
    outputElements.rentVerdictReasonOneValue.textContent = currencyFormatter.format(verdictPoint.ownerCumulativeOutflow);
    outputElements.rentVerdictReasonOneNote.textContent = `Includes Musharaka installments, property tax, condo fees, utilities, insurance, maintenance, and prepayment through year ${verdictPoint.year}.`;

    outputElements.rentVerdictReasonTwoLabel.textContent = 'Renter cumulative outflow';
    outputElements.rentVerdictReasonTwoValue.textContent = currencyFormatter.format(verdictPoint.renterCumulativeOutflow);
    outputElements.rentVerdictReasonTwoNote.textContent = 'Includes cumulative rent, renter insurance, and one-time moving cost with annual rent escalation applied.';

    outputElements.rentVerdictReasonThreeLabel.textContent = 'Year-end rent level';
    outputElements.rentVerdictReasonThreeValue.textContent = currencyFormatter.format(verdictPoint.yearEndRent);
    outputElements.rentVerdictReasonThreeNote.textContent = 'This is the monthly rent level reached by the end of the comparison year.';
}

function renderComparison(result) {
    const fiveYearPoint = result.comparisonTimeline[Math.min(4, result.comparisonTimeline.length - 1)] || null;
    const paymentGap = result.conventional.monthlyPayment - result.monthlyPayment;
    const payoffGap = result.conventional.payoffMonth - result.schedule.length;

    outputElements.compareMusharakaPayment.textContent = currencyFormatter.format(result.monthlyPayment);
    outputElements.compareMusharakaCost.textContent = currencyFormatter.format(result.totalMusharakaCost);
    outputElements.compareConventionalPayment.textContent = currencyFormatter.format(result.conventional.monthlyPayment);
    outputElements.compareConventionalCost.textContent = currencyFormatter.format(result.conventional.totalInterestCost);
    outputElements.comparePaymentGap.textContent = currencyFormatter.format(paymentGap);
    outputElements.compareFiveYearBalanceGap.textContent = fiveYearPoint ? currencyFormatter.format(fiveYearPoint.balanceGap) : 'N/A';
    outputElements.compareFiveYearEquityGap.textContent = fiveYearPoint ? percentFormatter.format(fiveYearPoint.equityGap) : 'N/A';
    outputElements.comparePayoffGap.textContent = `${numberFormatter.format(payoffGap)} months`;

    renderComparisonTimeline(result.comparisonTimeline);
}

function renderComparisonTimeline(timeline) {
    const rows = timeline.map((row) => `
        <tr>
            <td>${numberFormatter.format(row.year)}</td>
            <td>${currencyFormatter.format(row.musharakaBalance)}</td>
            <td>${percentFormatter.format(row.musharakaOwnership)}</td>
            <td>${currencyFormatter.format(row.musharakaCumulativeCost)}</td>
            <td>${currencyFormatter.format(row.conventionalBalance)}</td>
            <td>${percentFormatter.format(row.conventionalEquity)}</td>
            <td>${currencyFormatter.format(row.conventionalCumulativeCost)}</td>
            <td>${currencyFormatter.format(row.costGap)}</td>
        </tr>
    `).join('');

    comparisonBody.innerHTML = rows;
}

function buildYearlySchedule(schedule) {
    const yearlySchedule = [];

    for (let startIndex = 0; startIndex < schedule.length; startIndex += 12) {
        const yearRows = schedule.slice(startIndex, startIndex + 12);
        if (!yearRows.length) {
            continue;
        }

        const firstRow = yearRows[0];
        const lastRow = yearRows[yearRows.length - 1];

        yearlySchedule.push({
            year: yearlySchedule.length + 1,
            beginningBalance: firstRow.beginningBalance,
            totalInstallments: clampCurrency(yearRows.reduce((sum, row) => sum + row.totalInstallment, 0)),
            totalFundProfit: clampCurrency(yearRows.reduce((sum, row) => sum + row.paymentTowardFundProfit, 0)),
            totalShareCost: clampCurrency(yearRows.reduce((sum, row) => sum + row.paymentTowardShareCostPrice, 0)),
            totalPrepayment: clampCurrency(yearRows.reduce((sum, row) => sum + row.prepayment, 0)),
            totalSharePurchased: clampCurrency(yearRows.reduce((sum, row) => sum + row.sharePurchasedThisMonth, 0)),
            endingBalance: lastRow.endingBalance,
            yearEndOwnership: lastRow.clientOwnership,
        });
    }

    return yearlySchedule;
}

function renderScheduleHeader() {
    if (scheduleViewState.current === 'yearly') {
        scheduleSectionTitle.textContent = 'Yearly Schedule';
        scheduleSectionNote.textContent = 'This view rolls the monthly schedule into year-by-year totals so you can review balance reduction, financing cost, share purchases, and ownership growth more quickly.';
        scheduleTableHead.innerHTML = `
            <tr>
                <th>Year</th>
                <th>Beginning Fund Balance</th>
                <th>Total Installments</th>
                <th>Total Fund Profit</th>
                <th>Total Share Cost Price</th>
                <th>Total Pre-payment</th>
                <th>Total Share Purchased</th>
                <th>Ending Fund Balance</th>
                <th>Year-end Ownership</th>
            </tr>
        `;
        return;
    }

    scheduleSectionTitle.textContent = 'Monthly Schedule';
    scheduleSectionNote.textContent = 'Quarterly values are shown on period 1, 4, 7, and so on. Quarterly Sale Price is modeled as three monthly installments, and Quarterly Unit Transfer is the real three-month cumulative share purchase amount.';
    scheduleTableHead.innerHTML = `
        <tr>
            <th>Period</th>
            <th>Beginning Musharaka Fund's Contribution Balance</th>
            <th>
                <span class="th-label">Total Installment
                    <button
                        class="help-trigger"
                        type="button"
                        data-explanation-target="monthly-payment"
                        data-explanation-tab="calculator"
                        aria-label="Explain total installment"
                    >?</button>
                </span>
            </th>
            <th>
                <span class="th-label">Payment Towards Fund's Profit
                    <button
                        class="help-trigger"
                        type="button"
                        data-explanation-target="share-purchase"
                        data-explanation-tab="calculator"
                        aria-label="Explain payment towards fund profit"
                    >?</button>
                </span>
            </th>
            <th>
                <span class="th-label">Payment Towards Share Cost Price
                    <button
                        class="help-trigger"
                        type="button"
                        data-explanation-target="share-purchase"
                        data-explanation-tab="calculator"
                        aria-label="Explain payment towards share cost price"
                    >?</button>
                </span>
            </th>
            <th>Ending Fund's Contribution Balance</th>
            <th>Quarterly Sale Price</th>
            <th>Quarterly Share Transfer %</th>
            <th>
                <span class="th-label">Quarterly Unit Transfer
                    <button
                        class="help-trigger"
                        type="button"
                        data-explanation-target="quarterly-transfer"
                        data-explanation-tab="calculator"
                        aria-label="Explain quarterly unit transfer"
                    >?</button>
                </span>
            </th>
            <th>
                <span class="th-label">Annual % Transfer
                    <button
                        class="help-trigger"
                        type="button"
                        data-explanation-target="quarterly-transfer"
                        data-explanation-tab="calculator"
                        aria-label="Explain annual transfer percentage"
                    >?</button>
                </span>
            </th>
            <th>Client Ownership Percentage</th>
            <th>
                <span class="th-label">Pre-payment
                    <button
                        class="help-trigger"
                        type="button"
                        data-explanation-target="share-purchase"
                        data-explanation-tab="calculator"
                        aria-label="Explain prepayment"
                    >?</button>
                </span>
            </th>
        </tr>
    `;
}

function renderSchedule(schedule) {
    renderScheduleHeader();

    if (scheduleViewState.current === 'yearly') {
        const yearlyRows = buildYearlySchedule(schedule).map((row) => `
        <tr>
            <td>${numberFormatter.format(row.year)}</td>
            <td>${currencyFormatter.format(row.beginningBalance)}</td>
            <td>${currencyFormatter.format(row.totalInstallments)}</td>
            <td>${currencyFormatter.format(row.totalFundProfit)}</td>
            <td>${currencyFormatter.format(row.totalShareCost)}</td>
            <td>${currencyFormatter.format(row.totalPrepayment)}</td>
            <td>${currencyFormatter.format(row.totalSharePurchased)}</td>
            <td>${currencyFormatter.format(row.endingBalance)}</td>
            <td>${percentFormatter.format(row.yearEndOwnership)}</td>
        </tr>
    `).join('');

        scheduleBody.innerHTML = yearlyRows;
        syncStickyHeaderStructure();
        return;
    }

    const rows = schedule.map((row) => `
    <tr>
      <td>${numberFormatter.format(row.period)}</td>
      <td>${currencyFormatter.format(row.beginningBalance)}</td>
      <td>${currencyFormatter.format(row.totalInstallment)}</td>
      <td>${currencyFormatter.format(row.paymentTowardFundProfit)}</td>
      <td>${currencyFormatter.format(row.paymentTowardShareCostPrice)}</td>
      <td>${currencyFormatter.format(row.endingBalance)}</td>
            <td>${row.quarterlySalePrice === null ? '' : currencyFormatter.format(row.quarterlySalePrice)}</td>
      <td>${row.quarterlyShareTransfer === null ? '' : percentFormatter.format(row.quarterlyShareTransfer)}</td>
      <td>${row.quarterlyUnitTransfer === null ? '' : numberFormatter.format(row.quarterlyUnitTransfer)}</td>
            <td>${row.annualTransfer === null ? '' : percentFormatter.format(row.annualTransfer)}</td>
      <td>${percentFormatter.format(row.clientOwnership)}</td>
      <td>${currencyFormatter.format(row.prepayment)}</td>
    </tr>
  `).join('');

    scheduleBody.innerHTML = rows;
    syncStickyHeaderStructure();
}

function syncStickyHeaderStructure() {
    const sourceHeaderCells = Array.from(scheduleTableHead.querySelectorAll('th'));
    if (!sourceHeaderCells.length) {
        return;
    }

    stickyScheduleHeader.innerHTML = `<table aria-hidden="true"><thead>${scheduleTableHead.innerHTML}</thead></table>`;

    const stickyTable = stickyScheduleHeader.querySelector('table');
    const stickyHeaderCells = Array.from(stickyScheduleHeader.querySelectorAll('th'));

    stickyTable.style.width = `${scheduleTable.getBoundingClientRect().width}px`;

    sourceHeaderCells.forEach((cell, index) => {
        if (stickyHeaderCells[index]) {
            stickyHeaderCells[index].style.width = `${cell.getBoundingClientRect().width}px`;
        }
    });

    syncStickyHeaderPosition();
}

function syncStickyHeaderPosition() {
    const calculatorPanel = document.querySelector('[data-panel="calculator"]');
    if (!calculatorPanel || !calculatorPanel.classList.contains('active')) {
        stickyScheduleHeader.classList.remove('visible');
        return;
    }

    const sourceHeaderRect = scheduleTableHead.getBoundingClientRect();
    const tableRect = scheduleTable.getBoundingClientRect();
    const wrapRect = scheduleTableWrap.getBoundingClientRect();
    const stickyTop = 12;
    const shouldShow = sourceHeaderRect.top < stickyTop && tableRect.bottom > stickyTop + sourceHeaderRect.height;

    stickyScheduleHeader.classList.toggle('visible', shouldShow);

    if (!shouldShow) {
        return;
    }

    stickyScheduleHeader.style.left = `${wrapRect.left}px`;
    stickyScheduleHeader.style.width = `${wrapRect.width}px`;

    const stickyTable = stickyScheduleHeader.querySelector('table');
    if (stickyTable) {
        stickyTable.style.transform = `translateX(-${scheduleTableWrap.scrollLeft}px)`;
    }
}

function setActiveTab(tabName) {
    explanationState.activeTab = tabName;
    tabButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });

    tabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.panel === tabName);
    });

    syncStickyHeaderStructure();
    syncStickyHeaderPosition();
    renderExplanationPanel();
}

function updateCalculator() {
    const inputs = readInputs();
    const conventionalInputs = readConventionalInputs();
    const rentInputs = readRentInputs();
    const result = buildSchedule(inputs);
    const conventionalResult = buildSchedule(conventionalInputs);
    const rentTabMusharakaInputs = buildRentTabInputs(rentInputs);
    const rentTabResult = buildSchedule(rentTabMusharakaInputs);
    result.rentComparison = buildRentComparison(rentTabMusharakaInputs, rentTabResult, rentInputs);
    latestExplanationContext = {
        inputs,
        result,
        conventionalInputs,
        conventionalResult,
        rentInputs,
        rentTabResult,
        rentComparison: result.rentComparison,
    };
    renderSummary(result, inputs);
    renderComparison(conventionalResult);
    renderSchedule(result.schedule);
    renderExplanationPanel();
}

function setScheduleView(viewName) {
    scheduleViewState.current = viewName;
    scheduleViewButtons.forEach((button) => {
        const isActive = button.dataset.scheduleView === viewName;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    if (latestExplanationContext) {
        renderSchedule(latestExplanationContext.result.schedule);
    }
}

function resetDefaults() {
    Object.entries(defaultInputs).forEach(([key, value]) => {
        const input = document.querySelector(`#${key}`);
        if (input) {
            input.value = value;
        }
    });
    updateCalculator();
}

form.addEventListener('input', updateCalculator);
conventionalComparisonForm.addEventListener('input', updateCalculator);
rentComparisonForm.addEventListener('input', updateCalculator);
resetDefaultsButton.addEventListener('click', resetDefaults);
scheduleTableWrap.addEventListener('scroll', syncStickyHeaderPosition);
window.addEventListener('scroll', syncStickyHeaderPosition, { passive: true });
window.addEventListener('resize', syncStickyHeaderStructure);
explanationSearchInput.addEventListener('input', (event) => {
    explanationState.filter = event.target.value.trim().toLowerCase();
    renderExplanationPanel();
});
document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-explanation-target]');
    if (!trigger) {
        return;
    }

    event.preventDefault();
    openExplanationTopic(trigger.dataset.explanationTarget, trigger.dataset.explanationTab || explanationState.activeTab);
});
closeExplanationModalButton?.addEventListener('click', closeExplanationModal);
explanationModal?.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.hasAttribute('data-modal-close')) {
        closeExplanationModal();
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && explanationModal && !explanationModal.hidden) {
        closeExplanationModal();
    }
});
tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tab));
});
scheduleViewButtons.forEach((button) => {
    button.addEventListener('click', () => setScheduleView(button.dataset.scheduleView));
});

updateCalculator();