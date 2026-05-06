import {Link} from "react-router";
import {useState} from "react";


const CVCard = ({ cv: { id, companyName, jobTitle } }: { cv: CV }) => {

    const [cvUrl, setCVUrl] = useState('');



    return (
        <Link to={`/cv/${id}`} className="cv-card animate-in fade-in duration-1000">
            <div className="cv-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="text-black! font-bold wrap-break-word">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="text-black! font-bold">CV</h2>}
                </div>
                <div className="shrink-0">

                </div>
            </div>
            {cvUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={cvUrl}
                            alt="cv"
                            className="w-full h-87.5 max-sm:h-50 object-cover object-top"
                        />
                    </div>
                </div>
            )}
        </Link>
    )
}
export default CVCard;
