import { makeRequest  } from './makeRequest';

export function getTransactions({ userId }) {
    return makeRequest(`/users/${userId}/transactions`).catch(error => {
        console.log(error);
        return [];
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