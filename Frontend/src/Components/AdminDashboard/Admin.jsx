import React from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
    return (
        <div className='w-11/12 mx-auto m-10'>
            <div>
                <h1 className='text-center text-3xl mb-10 font-bold'>Admin Section</h1>
            </div>
            <div className='flex gap-3'>
                <Link to={`/addteacher`} className="btn">Add Teacher</Link>
                <Link to={`/addstudent`} className="btn">Add Student</Link>
                <Link to={`/assignteacher`} className="btn">Assign Teacher</Link>
            </div>
        </div>
    );
};

export default Admin;