import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { getTransactions } from '../../services/userTransactions';
import { getTotalNZFundContributions } from "../../services/userTransactions";
import { getTotalInvested } from "../../services/userInvestments";
import Layout from '../layout/Layout';
import { parseDate } from '../../util/parseDate';
import { sortTransactionsBy } from '../../util/sortBy';

export default function TransactionHistory({ userId }) {

    const [sortType, setSortType] = useState('newest');

    const { loadingA, errorA, value: transactions } = useAsync(() => getTransactions({ userId }), [userId]);

    const { loadingB, errorB, value: totalNZFundContribution } = useAsync(() => getTotalNZFundContributions({ userId }), [userId]);

    const { loadingC, errorC, value: totalInvested } = useAsync(() => getTotalInvested({ userId }), [userId]);

    const navigate = useNavigate();
    const viewTransaction = (transaction) => {
        navigate(`/transactions/${transaction.id}`);
    }

    if (loadingA || loadingB || loadingC) return <h1>Loading</h1>

    if (errorA || errorB || errorC) return <h1 className="error-msg">{errorA || errorB || errorC}</h1>

    return (
        <Layout>
            <h2 className='page-title'>Transaction history</h2>

            <div className='page-header'>
                <div className='page-header__info'>
                    <div className='balance-info coloured'>
                        <h6 className='balance-info__label'>Net Zero Fund</h6>
                        <p className='balance-info__amount'>£{typeof (totalNZFundContribution - totalInvested) === 'number' ? (totalNZFundContribution - totalInvested)?.toFixed(2) : 0}</p>
                    </div>
                    <div className='balance-info'>
                        <h6 className='balance-info__label'>Total contributions</h6>
                        <p className='balance-info__amount'>£{typeof totalNZFundContribution === 'number' ? totalNZFundContribution?.toFixed(2) : 0}</p>
                    </div>
                </div>
                <div className='page-header__buttons'>
                    <select 
                        className='rounded-button' 
                        name="sort-by" 
                        id="sort-by" 
                        onChange={e => {setSortType(e.target.value)}}
                    > 
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option> 
                        <option value="trans-amount-desc">Amount desc</option> 
                        <option value="trans-amount-asc">Amount asc</option> 
                        <option value="contr-amount-desc">NZF contribution desc</option>
                        <option value="contr-amount-asc">NZF contribution asc</option> 
                    </select>
                    {/* <button className='rounded-button'>Filter</button> */}
                    <Link 
                        to='/add-transaction'
                        className='rounded-button coloured'
                    >+ Add new</Link>
                </div>
            </div>

            <div className='page-table-container component-container transactions-page-table'>
                {transactions?.length > 0 ? (
                    <table>
                        <thead>
                            <tr className='top-row'>
                                <th className='column-date'>Date</th>
                                <th className='column-amount'>Amount</th>
                                <th className='column-rounded-amount'>Rounded up</th>
                                <th className='column-contribution'>Added to NZF</th>
                                <th className='column-payment-method'>Payment method</th>
                                <th className='column-description'>Description</th>
                            </tr>
                        </thead>
                        <tbody className='transaction-history-table-body'>
                            {sortTransactionsBy(transactions, sortType).map(transaction => 
                                <tr 
                                    key={transaction.id} 
                                    onClick={() => viewTransaction(transaction)}
                                    className='link-effect'
                                >
                                    <td className='column-date'>{parseDate(transaction.date)}</td>
                                    <td className='column-amount'>£{Number(transaction.amount)}</td>
                                    <td className='column-rounded-amount'>£{transaction.roundedAmount}</td>
                                    <td className='column-contribution'>£{Number(transaction.fundContribution).toFixed(2)}</td>
                                    <td className='column-payment-method'>{transaction.paymethod.type} ending in {transaction.paymethod.cardNumber.slice(-4)}</td>
                                    <td  className='column-description'>{transaction.description}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <p>You haven't made any transactions yet</p>
                )}
            </div>

        </Layout>
    );
}
