import React from 'react';
import './style.css';


//    component: 화면 컴포넌트           //
export default function mainView() {

    //   render:  화면 컴포넌트 랜더링      //
    return (

        <div id='main-wrapper'>
            <div className='container'>
                <div className='container-box'>
                    <div className='title-box'>
                        <input className='title-input'/>
                    </div>
                    <div className='dibider'></div>
                    <div className='content-box'>
                        <textarea className='content-text'></textarea>
                    </div>
                </div>
            </div>
        </div>
    )    
}