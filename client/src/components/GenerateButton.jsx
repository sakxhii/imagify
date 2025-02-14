import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const GenerateButton = () => {

  const {user, setshowLogin} = useContext(AppContext)
  const navigate = useNavigate()

  const onClickHandler = ()=>{
    if (user){
      navigate('/result')
    } else {
      setshowLogin(true)
    }
  }

  return (
    <div className='pb-16 text-center'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold
        text-neutral-800 py-6 md:py-16'>
            See the magic. Try now</h1>

        <button onClick={onClickHandler} 
                className='inline-flex sm:text-lg text-white bg-black w-auto
            mt-8 px-12 py-3 items-center gap-2 rounded-full hover:scale-105 transition-all duration-500'>
        Generate Images
        <img src={assets.star_group} alt="" className='h-6'/>
      </button>
    </div>
  )
}

export default GenerateButton