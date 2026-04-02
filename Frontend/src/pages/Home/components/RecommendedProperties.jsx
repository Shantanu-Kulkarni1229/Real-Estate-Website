import RecommendedRegionSection from './sections/RecommendedRegionSection'
import BudgetFriendlySection from './sections/BudgetFriendlySection'
import ReadyToMoveSection from './sections/ReadyToMoveSection'
import FamilyFriendlySection from './sections/FamilyFriendlySection'

const RecommendedProperties = () => {
  return (
    <section className="mx-auto mt-12 w-[92%] max-w-7xl pb-12">
      <div className="space-y-12">
        <RecommendedRegionSection />
        <BudgetFriendlySection />
        <ReadyToMoveSection />
        <FamilyFriendlySection />
      </div>
    </section>
  )
}

export default RecommendedProperties
