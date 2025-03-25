import React from 'react';
import './MainContent.css';
import Background from './Background';
import StartButton from './StartButton';
import Description from './Description';
import Mascot from './Mascot';

const MainContent: React.FC = () => {
    return (
        <main className="main-content">
            <Background />
            <StartButton />
            <Description />
            <Mascot />
            <div className='welcome-mess1'>
                <h1>SQULIO to przyjazna dla użytkownika platforma edukacyjna, która łączy elementy zabawy oraz nauki. Stwórz swoją unikalną postać i ruszaj w kosmiczną przygodę!
                </h1>
            </div>

        </main>
    );
};


export default MainContent;
