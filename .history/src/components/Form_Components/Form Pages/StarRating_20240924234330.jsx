import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { FrmQuestion, FrmQuestionController } from "../FrmQuestion";
import { FrmDesc, FrmDescController } from "../FrmDesc";
import { RvwStrViewer, RvwStrController } from "../RvwStr";
import { FrmBtn, FrmBtnController } from "../FrmBtn";
import useFormStore from "../../../app/FormStore";
import { availablePages } from "../../../utils/availablePagesData";

const defaultMetadata = availablePages.find(page => page.pageName === "Star Rating").componentsMetaData;

const StarRating = ({ pageData }) => {
    const { formId } = useParams();
    const updateForm = useFormStore((state) => state.updateForm);
    const forms = useFormStore((state) => state.forms);
    const isInitialMount = useRef(true);

    const [formState, setFormState] = useState(() => ({
        ...pageData,
        componentsMetaData: {
            question: { 
                val: pageData?.componentsMetaData[0]?.question?.val ?? defaultMetadata.question.val,
                description: pageData?.componentsMetaData[0]?.question?.description ?? defaultMetadata.question.description
            },
            stars: {
                val: pageData?.componentsMetaData[0]?.stars?.val ?? defaultMetadata.stars.val
            },
            button: { 
                val: pageData?.componentsMetaData[0]?.button?.val ?? defaultMetadata.button.val 
            }
        }
    }));

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setFormState(prevState => ({
                ...pageData,
                componentsMetaData: {
                    question: { 
                        val: pageData?.componentsMetaData[0]?.question?.val ?? prevState.componentsMetaData.question.val,
                        description: pageData?.componentsMetaData[0]?.question?.description ?? prevState.componentsMetaData.question.description
                    },
                    stars: {
                        val: pageData?.componentsMetaData[0]?.stars?.val ?? prevState.componentsMetaData.stars.val
                    },
                    button: { 
                        val: pageData?.componentsMetaData[0]?.button?.val ?? prevState.componentsMetaData.button.val 
                    }
                }
            }));
        }
    }, [pageData]);

    const handleChange = useCallback((path, value) => {
        setFormState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState));
            let current = newState;
            const keys = path.split('.');

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            const currentForm = forms.find(form => form.formId === formId);
            if (currentForm) {
                updateForm({
                    ...currentForm,
                    pages: currentForm.pages.map(page =>
                        page.pageId === newState.pageId ? newState : page
                    )
                });
            }

            return newState;
        });
    }, [formId, forms, updateForm]);

    if (!formState) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div id="viewer" className="w-full px-20 space-y-4 pointer-events-none">
                {formState.componentsMetaData[0]?.question?.val && <FrmQuestion text={formState.componentsMetaData[0]?.question?.val} />}
                {formState.componentsMetaData[0]?.question?.description && <FrmDesc text={formState.componentsMetaData[0]?.question?.description} />}
                <RvwStrViewer numStars={formState.componentsMetaData[0]?.stars?.val} />
                <FrmBtn text={formState.componentsMetaData[0]?.button?.val} />
            </div>
            <div id="controls" className="w-[27vw] p-4 h-[86.9vh] fixed bg-gray-100 bottom-0 -right-10 flex flex-col space-y-4 overflow-y-auto">
                <FrmQuestionController
                    text={formState.componentsMetaData[0]?.question?.val}
                    onTextChange={(newText) => handleChange('componentsMetaData.question.val', newText)}
                />
                <FrmDescController
                    text={formState.componentsMetaData[0]?.question?.description}
                    onTextChange={(newDesc) => handleChange('componentsMetaData.question.description', newDesc)}
                />
                <RvwStrController
                    numStars={formState.componentsMetaData[0]?.stars?.val}
                    onNumStarsChange={(newNumStars) => handleChange('componentsMetaData.stars.val', newNumStars)}
                />
                <FrmBtnController
                    text={formState.componentsMetaData[0]?.button?.val}
                    onTextChange={(newText) => handleChange('componentsMetaData.button.val', newText)}
                />
            </div>
        </>
    );
};

export default StarRating;
