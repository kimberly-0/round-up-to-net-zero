import { useState } from 'react';
import { useAsync } from '../../../hooks/useAsync';
import { useAsyncFn } from '../../../hooks/useAsync';
import { getUser } from '../../../services/user';
import { updatePaymethod } from '../../../services/userPaymethods';

export default function PaymentMethodsSettings({  
    userId,
    onSubmit,
    initialData = {
        paymethods: []
    } }) {

    const [userPaymethods, setUserPaymethods] = useState(initialData.paymethods);

    const { loadingUser, errorUser } = useAsync(() => getUser({ userId }).then(user => {
        console.log("user.paymethods:" +  JSON.stringify(user.paymethods, null, 1));

        setUserPaymethods(user.paymethods);
    }), [userId]);

    const { loadingUpdate, errorUpdate, execute: updatePaymethodFn } = useAsyncFn(updatePaymethod);

    function toggleChecked(paymethodId) {
        const paymethodObject = userPaymethods.find(paymethod => paymethod.id === paymethodId);
        onSubmit({
            updateFn: updatePaymethodFn, 
            args: { 
                userId, 
                paymethodId,
                paymethod: {
                    cardNumber: paymethodObject.cardNumber,
                    type: paymethodObject.type,
                    monitored: !paymethodObject.monitored,
                }
            }, 
            confirmMessage: 'Are you sure you want to ' + (!paymethodObject.monitored ? `have ${paymethodObject.type} ending in ${paymethodObject.cardNumber} monitored?` : `stop monitoring ${paymethodObject.type} ending in ${paymethodObject.cardNumber}?`)             
        })?.then(() => {
            const newUserPaymethods = userPaymethods.map(paymethod => {
                if (paymethod.id === paymethodId) {
                    return {...paymethod, monitored: !paymethod.monitored};
                }
                return paymethod;
            });
            setUserPaymethods(newUserPaymethods);
        });
    }

    if (loadingUser) return <h1>Loading</h1>

    if (errorUser) return <h1 className="error-msg">{errorUser}</h1>

    return (
        <div className='page-table-container component-container'>
            <div className='settings-title-container'>
                <h2 className='section-title'>Payment methods</h2>
                <p>Update your payment details here.</p>
            </div>

            <form className='settings-form one-row' >
                <div className='input-container full-width'>
                    <div className='paymethods-label-container'>
                        <label>Linked payment methods</label>
                        <label htmlFor='monitored' className='paymethods-list-item-label'>Monitored</label>
                    </div>
                    <div className="paymethods-list">
                        {userPaymethods?.length > 0 ? (
                            userPaymethods.map(paymethod => 
                                <ul className='paymethods-list-item-box' key={paymethod.id}>
                                    <li>{paymethod.type} ending in {paymethod.cardNumber}</li>
                                    <input 
                                        type="checkbox" 
                                        id='monitored' 
                                        checked={paymethod.monitored}
                                        onChange={() => toggleChecked(paymethod.id)}
                                        disabled={loadingUpdate}
                                    ></input>
                                </ul>
                            )
                        ) : (
                            <p>There are no linked payment methods</p>
                        )}
                    </div>
                </div>

                <div className='transaction-form-section button-section  full-width'>
                    <p className={`error-msg ${!errorUpdate ? "hide" : ""}`}>{errorUpdate}</p>
                    <button 
                        className='form-button rounded-button coloured-light' 
                        type='button'
                        disabled={loadingUser}
                    >Add new payment method</button>
                </div>
            </form>
        </div>
    )
}

