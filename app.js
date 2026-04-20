const defaultInputs = {
    purchasePrice: 700000,
    downPayment: 200000,
    profitRateAnnual: 6.75,
    termYears: 25,
    propertyTaxMonthly: 350,
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
const rentComparisonForm = document.querySelector('#rentComparisonForm');
const scheduleBody = document.querySelector('#scheduleBody');
const resetDefaultsButton = document.querySelector('#resetDefaultsButton');
const scheduleTableWrap = document.querySelector('#scheduleTableWrap');
const scheduleTable = document.querySelector('#scheduleTable');
const scheduleTableHead = document.querySelector('#scheduleTableHead');
const stickyScheduleHeader = document.querySelector('#stickyScheduleHeader');
const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

const outputElements = {
    monthlyPayment: document.querySelector('#monthlyPaymentValue'),
    stressTestedPayment: document.querySelector('#stressTestedPaymentValue'),
    propertyTax: document.querySelector('#propertyTaxValue'),
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

function readInputs() {
    const raw = new FormData(form);
    const inputValues = Object.fromEntries(
        Array.from(raw.entries()).map(([key, value]) => [key, Number(value)])
    );

    return {
        purchasePrice: Math.max(0, inputValues.purchasePrice),
        downPayment: Math.max(0, inputValues.downPayment),
        profitRateAnnual: Math.max(0, inputValues.profitRateAnnual) / 100,
        conventionalRateAnnual: Math.max(0, inputValues.conventionalRateAnnual) / 100,
        termYears: Math.max(1, Math.round(inputValues.termYears || 1)),
        propertyTaxMonthly: Math.max(0, inputValues.propertyTaxMonthly),
        qualificationRatio: Math.max(0.01, inputValues.qualificationRatio / 100),
        monthlyPrepayment: Math.max(0, inputValues.monthlyPrepayment),
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

    const requiredMonthlyIncome = clampCurrency(stressTestedPayment / inputs.qualificationRatio);
    const requiredAnnualIncome = clampCurrency(requiredMonthlyIncome * 12);
    const incomeMultiple = 1 / inputs.qualificationRatio;
    const conventional = buildConventionalSchedule(inputs, financingAmount, termMonths);
    const comparisonTimeline = buildComparisonTimeline(schedule, conventional.schedule, inputs.termYears);

    return {
        financingAmount,
        termMonths,
        monthlyPayment,
        stressTestedPayment,
        requiredMonthlyIncome,
        requiredAnnualIncome,
        incomeMultiple,
        propertyTaxMonthly: inputs.propertyTaxMonthly,
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

function renderSummary(result, inputs) {
    outputElements.monthlyPayment.textContent = currencyFormatter.format(result.monthlyPayment);
    outputElements.stressTestedPayment.textContent = currencyFormatter.format(result.stressTestedPayment);
    outputElements.propertyTax.textContent = currencyFormatter.format(result.propertyTaxMonthly);
    outputElements.requiredMonthlyIncome.textContent = currencyFormatter.format(result.requiredMonthlyIncome);
    outputElements.requiredAnnualIncome.textContent = currencyFormatter.format(result.requiredAnnualIncome);
    outputElements.incomeMultiple.textContent = `${result.incomeMultiple.toFixed(2)}x`;
    outputElements.financingAmount.textContent = currencyFormatter.format(result.financingAmount);
    outputElements.termMonths.textContent = numberFormatter.format(result.termMonths);
    outputElements.finalBalance.textContent = currencyFormatter.format(result.finalBalance);
    outputElements.finalOwnership.textContent = percentFormatter.format(result.finalOwnership);
    outputElements.totalSharePurchased.textContent = currencyFormatter.format(result.totalSharePurchased);
    outputElements.latestQuarterTransfer.textContent = percentFormatter.format(result.latestQuarterTransfer || 0);
    renderComparison(result);
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

function renderSchedule(schedule) {
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
    tabButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });

    tabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.panel === tabName);
    });

    syncStickyHeaderStructure();
    syncStickyHeaderPosition();
}

function updateCalculator() {
    const inputs = readInputs();
    const rentInputs = readRentInputs();
    const result = buildSchedule(inputs);
    const rentTabMusharakaInputs = buildRentTabInputs(rentInputs);
    const rentTabResult = buildSchedule(rentTabMusharakaInputs);
    result.rentComparison = buildRentComparison(rentTabMusharakaInputs, rentTabResult, rentInputs);
    renderSummary(result, inputs);
    renderSchedule(result.schedule);
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
rentComparisonForm.addEventListener('input', updateCalculator);
resetDefaultsButton.addEventListener('click', resetDefaults);
scheduleTableWrap.addEventListener('scroll', syncStickyHeaderPosition);
window.addEventListener('scroll', syncStickyHeaderPosition, { passive: true });
window.addEventListener('resize', syncStickyHeaderStructure);
tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tab));
});

updateCalculator();