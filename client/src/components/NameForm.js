import React, { useState } from 'react';
import './NameForm.css';

// A component that is a form for getting user name input
// It has a text input and a submit button
// It can notify game component of name submission

const NameForm = (props) => {
    // const [name, setName] = useState('');

    // function handleChange(event) {
    //     setName(event.target.value);
    // }

    function sendStartGame(event) {
        event.preventDefault();
        props.onSubmit();
    }

    function logout(event) {
        event.preventDefault();
        props.logout();
    }

    return (
        <div>
            <button class='start-btn' onClick={sendStartGame}>Start game</button>
            <button class='start-btn' onClick={logout}>Log out</button>
        </div>
    );
};

export default NameForm;
