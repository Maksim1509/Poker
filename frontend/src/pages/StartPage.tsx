import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import './StartPage.scss';

const StartPage: FC = () => {
  return (
    <>
      <div className='start-page-container'>
        <h1 className='app-title'>
          <span className='char1'>p</span>
          <span className='char2'>o</span>
          <span className='char3'>k</span>
          <span className='char4'>e</span>
          <span className='char5'>r</span>
          <span className='char6'> </span>
          <span className='char7'>s</span>
          <span className='char8'>t</span>
          <span className='char9'>a</span>
          <span className='char10'>r</span>
          <span className='char11'>s</span>
        </h1>
        <div className='form-container'>
          <Outlet />
        </div>
        <Link target='_blank' to='https://github.com/OlegVoitko'>
          <span className='logo__footer logo__footer_github_1'></span>
        </Link>
        <Link target='_blank' to='https://github.com/Maksim1509'>
          <span className='logo__footer logo__footer_github_2'></span>
        </Link>
        <Link target='_blank' to='https://github.com/Vi-user'>
          <span className='logo__footer logo__footer_github_3'></span>
        </Link>
        <Link target='_blank' to='https://rs.school/js/'>
          <span className='logo__footer logo__footer_rsSchool'></span>
        </Link>
      </div>
    </>
  );
};

export default StartPage;
