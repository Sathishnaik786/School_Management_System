import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
    MasterDataService,
    SchoolMaster,
    AcademicYearMaster,
    GradeMaster,
    TransportRouteMaster,
    FeeStructureMaster,
    OfferTemplateMaster,
    CounselorMaster
} from '../services/MasterDataService';

export interface MasterDataContextType {
    schools: SchoolMaster[];
    academicYears: AcademicYearMaster[];
    grades: GradeMaster[];
    transportRoutes: TransportRouteMaster[];
    feeStructures: FeeStructureMaster[];
    offerTemplates: OfferTemplateMaster[];
    counselors: CounselorMaster[];

    activeSchoolId: string;
    activeAcademicYearId: string;
    activeSchool: SchoolMaster | null;
    activeAcademicYear: AcademicYearMaster | null;

    changeSchool: (id: string) => void;
    changeAcademicYear: (id: string) => void;

    isLoading: boolean;
    isError: boolean;
    refetch: () => void;

    // Static master arrays
    boards: string[];
    quotas: string[];
    categories: string[];
    admissionSources: string[];
    bloodGroups: string[];
    religions: string[];
    occupations: string[];
    relationships: string[];
    countries: string[];
    states: string[];
    cities: string[];
    hostelRoomTypes: string[];
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();

    const [activeSchoolId, setActiveSchoolId] = useState<string>('');
    const [activeAcademicYearId, setActiveAcademicYearId] = useState<string>('');

    // Update active school ID from user session when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.school_id) {
            setActiveSchoolId(user.school_id);
        }
    }, [isAuthenticated, user]);

    // 1. Schools query
    const schoolsQuery = useQuery({
        queryKey: ['master', 'schools'],
        queryFn: () => MasterDataService.getSchools(),
        enabled: isAuthenticated,
    });

    // 2. Academic Years query
    const academicYearsQuery = useQuery({
        queryKey: ['master', 'academic-years', activeSchoolId],
        queryFn: () => MasterDataService.getAcademicYears(activeSchoolId),
        enabled: isAuthenticated && !!activeSchoolId,
    });

    // Automatically resolve the active academic year for the school
    useEffect(() => {
        if (academicYearsQuery.data && academicYearsQuery.data.length > 0) {
            const activeYr = academicYearsQuery.data.find(y => y.is_active);
            if (activeYr) {
                setActiveAcademicYearId(activeYr.id);
            } else {
                setActiveAcademicYearId(academicYearsQuery.data[0].id);
            }
        } else {
            setActiveAcademicYearId('');
        }
    }, [academicYearsQuery.data]);

    // 3. Grades/Classes query
    const gradesQuery = useQuery({
        queryKey: ['master', 'grades', activeSchoolId, activeAcademicYearId],
        queryFn: () => MasterDataService.getGrades(),
        enabled: isAuthenticated && !!activeSchoolId && !!activeAcademicYearId,
    });

    // 4. Transport Routes query
    const transportRoutesQuery = useQuery({
        queryKey: ['master', 'transport-routes', activeSchoolId],
        queryFn: () => MasterDataService.getTransportRoutes(),
        enabled: isAuthenticated && !!activeSchoolId,
    });

    // 5. Fee Structures query
    const feeStructuresQuery = useQuery({
        queryKey: ['master', 'fee-structures', activeSchoolId],
        queryFn: () => MasterDataService.getFeeStructures(),
        enabled: isAuthenticated && !!activeSchoolId,
    });

    // 6. Offer Templates query
    const offerTemplatesQuery = useQuery({
        queryKey: ['master', 'offer-templates', activeSchoolId],
        queryFn: () => MasterDataService.getOfferTemplates(),
        enabled: isAuthenticated && !!activeSchoolId,
    });

    // 7. Counselors query
    const counselorsQuery = useQuery({
        queryKey: ['master', 'counselors', activeSchoolId],
        queryFn: () => MasterDataService.getCounselors(activeSchoolId),
        enabled: isAuthenticated && !!activeSchoolId,
    });

    // Derive active school object
    const activeSchool = useMemo(() => {
        return schoolsQuery.data?.find(s => s.id === activeSchoolId) || null;
    }, [schoolsQuery.data, activeSchoolId]);

    // Derive active academic year object
    const activeAcademicYear = useMemo(() => {
        return academicYearsQuery.data?.find(y => y.id === activeAcademicYearId) || null;
    }, [academicYearsQuery.data, activeAcademicYearId]);

    const changeSchool = (id: string) => {
        setActiveSchoolId(id);
        setActiveAcademicYearId(''); // reset and let effect resolve
    };

    const changeAcademicYear = (id: string) => {
        setActiveAcademicYearId(id);
    };

    const refetch = () => {
        void schoolsQuery.refetch();
        void academicYearsQuery.refetch();
        void gradesQuery.refetch();
        void transportRoutesQuery.refetch();
        void feeStructuresQuery.refetch();
        void offerTemplatesQuery.refetch();
        void counselorsQuery.refetch();
    };

    const isLoading =
        schoolsQuery.isLoading ||
        academicYearsQuery.isLoading ||
        gradesQuery.isLoading ||
        transportRoutesQuery.isLoading ||
        feeStructuresQuery.isLoading ||
        offerTemplatesQuery.isLoading ||
        counselorsQuery.isLoading;

    const isError =
        schoolsQuery.isError ||
        academicYearsQuery.isError ||
        gradesQuery.isError ||
        transportRoutesQuery.isError ||
        feeStructuresQuery.isError ||
        offerTemplatesQuery.isError ||
        counselorsQuery.isError;

    const contextValue: MasterDataContextType = {
        schools: schoolsQuery.data || [],
        academicYears: academicYearsQuery.data || [],
        grades: gradesQuery.data || [],
        transportRoutes: transportRoutesQuery.data || [],
        feeStructures: feeStructuresQuery.data || [],
        offerTemplates: offerTemplatesQuery.data || [],
        counselors: counselorsQuery.data || [],

        activeSchoolId,
        activeAcademicYearId,
        activeSchool,
        activeAcademicYear,

        changeSchool,
        changeAcademicYear,

        isLoading,
        isError,
        refetch,

        // Static standard lookups
        boards: MasterDataService.getBoards(),
        quotas: MasterDataService.getQuotas(),
        categories: MasterDataService.getCategories(),
        admissionSources: MasterDataService.getAdmissionSources(),
        bloodGroups: MasterDataService.getBloodGroups(),
        religions: MasterDataService.getReligions(),
        occupations: MasterDataService.getOccupations(),
        relationships: MasterDataService.getRelationships(),
        countries: MasterDataService.getCountries(),
        states: MasterDataService.getStates(),
        cities: MasterDataService.getCities(),
        hostelRoomTypes: MasterDataService.getHostelRoomTypes(),
    };

    return (
        <MasterDataContext.Provider value={contextValue}>
            {children}
        </MasterDataContext.Provider>
    );
}

export function useMasterData() {
    const context = useContext(MasterDataContext);
    if (context === undefined) {
        throw new Error('useMasterData must be used within a MasterDataProvider');
    }
    return context;
}
