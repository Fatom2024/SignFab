// --- Number to Words Utility ---
const unitsMap: string[] = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const tensMap: string[] = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

const convertBelowThousand = (n: number): string => {
    if (n < 20) {
        return unitsMap[n];
    }
    if (n < 100) {
        const ten = Math.floor(n / 10);
        const unit = n % 10;
        if (unit === 0) {
            return tensMap[ten] + (ten === 8 ? 's' : '');
        }
        if (unit === 1 && ten < 8 && ten > 1) {
            return tensMap[ten] + " et un";
        }
        if (ten === 7 || ten === 9) {
            return tensMap[ten - 1] + "-" + unitsMap[10 + unit];
        }
        return tensMap[ten] + "-" + unitsMap[unit];
    }
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredStr = hundred === 1 ? "cent" : unitsMap[hundred] + " cent";
    if (remainder === 0) {
        return hundredStr + (hundred > 1 ? 's' : '');
    }
    return hundredStr + " " + convertBelowThousand(remainder);
};

const numberToWords = (num: number): string => {
    const intNum = Math.floor(num);
    if (intNum === 0) return "zéro";

    const parts: string[] = [];
    const billions = Math.floor(intNum / 1000000000);
    const millions = Math.floor((intNum % 1000000000) / 1000000);
    const thousands = Math.floor((intNum % 1000000) / 1000);
    const remainder = intNum % 1000;

    if (billions > 0) parts.push(convertBelowThousand(billions) + " milliard" + (billions > 1 ? "s" : ""));
    if (millions > 0) parts.push(convertBelowThousand(millions) + " million" + (millions > 1 ? "s" : ""));
    if (thousands > 0) {
        if (thousands === 1) parts.push("mille");
        else parts.push(convertBelowThousand(thousands) + " mille");
    }
    if (remainder > 0) parts.push(convertBelowThousand(remainder));

    return parts.join(" ");
};

export const numberToWordsCurrency = (num: number, currency: string = 'Dinars Algériens'): string => {
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = numberToWords(integerPart);
    result = result.charAt(0).toUpperCase() + result.slice(1);
    result += " " + currency;

    if (decimalPart > 0) {
        result += ` et ${numberToWords(decimalPart)} centimes`;
    }
    return result;
};

export const formatCurrency = (value: number): string => 
    value.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });