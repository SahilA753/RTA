import TitleSection from '@/components/landing-page/title_section'
import { Button } from '@/components/ui/button'
import React from 'react'

const Homepage = () => {
  return (
    <section className="overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col gap-4 md:justify-center md:items-center"> 
     <TitleSection
          pill="✨ Your Workspace, Perfected"
          title="All-In-One Collaboration and Productivity Platform"
        />
      <div className="bg-white p-[2px] mt-6 rounded-xl bg-gradient-to-r from-primary to-brand-primaryBlue sm:w-[300px]">
          <Button variant="btn-secondary" className=" w-full rounded-[10px] p-6 text-2xl bg-background">
            Get Cypress Free
          </Button>
        </div>
    </section>

  )
}

export default Homepage
