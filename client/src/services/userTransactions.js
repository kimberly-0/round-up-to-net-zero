import { makeRequest  } from './makeRequest';

export function getTransactions({ userId }) {
    return makeRequest(`/users/${userId}/transactions`).catch(error => {
        console.log("Unable to retrieve transactions");
        return [];
    });
}

export function createTransaction({ userId, transaction }) {
    return makeRequest(`/users/${userId}/transactions`, {
        method: "POST",
        data: { transaction: transaction },
    });
}

export function getTotalNZFundContributions({ userId }) {
    return getTransactions({ userId }).then(transactions => {
        if (transactions) {
            let totalContribution = 0;
            transactions.forEach(transaction => {
                totalContribution += Number(transaction.fundContribution);
            })
            return totalContribution;
        }
        return 0;
    }).catch(error => {
        console.log(error);
        return 0;
    });
}