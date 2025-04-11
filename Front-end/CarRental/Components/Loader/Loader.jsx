import React from 'react';
import "./Loader.css"

const Loader = () => {
    return (
        <div className="loader__wrapper">
            <div class="wrapper">
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="shadow"></div>
                <div class="shadow"></div>
                <div class="shadow"></div>
            </div>
        </div>

    );
}


export default Loader;