import { createContext, useContext, type ComponentType } from 'react';
import type { InspectionImage } from '../domain/models';
export interface ReviewPanelProps {image:InspectionImage;onDirtyChange:(dirty:boolean)=>void}
export const ReviewSlotContext=createContext<ComponentType<ReviewPanelProps>|null>(null);
export function ReviewSlot(props:ReviewPanelProps){const Panel=useContext(ReviewSlotContext);return Panel?<Panel {...props}/>:null;}
