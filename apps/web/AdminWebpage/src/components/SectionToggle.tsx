import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon

interface SectionToggleProps {
    sectionTitle: string;
    children: React.ReactNode;
}

const toggleSection = (event) => {
    const triangle = event.currentTarget as HTMLElement;
    if (triangle) {
        triangle.classList.toggle('rotated');
        triangle.parentElement?.nextElementSibling?.classList.toggle('hidden');
    }

}

const SectionToggle = ({ sectionTitle, children }: SectionToggleProps) => {
    return(
        <div className="section-toggle">
            <div className="section-toggle-header flex flex--align-center gap-1 mb-1">
                <FontAwesomeIcon icon={faPlay} className="toggleSection triangle" onClick={toggleSection} />
                {sectionTitle}
            </div>
            <div className="section-content hidden">
                {children}
            </div>
        </div>
    );
}

export default SectionToggle;