
export type State = {
    name: string;
    code: string;
};

export type Country = {
    name: string;
    code: string;
    states: State[];
};

export const COUNTRIES: Country[] = [
    {
        name: 'Australia',
        code: 'AU',
        states: [
            { name: 'New South Wales', code: 'NSW'},
            { name: 'Victoria', code: 'VIC'},
            { name: 'Queensland', code: 'QLD'},
            { name: 'Western Australia', code: 'WA'},
            { name: 'South Australia', code: 'SA'},
            { name: 'Tasmania', code: 'TAS'},
            { name: 'Australian Capital Territory', code: 'ACT'},
            { name: 'Northern Territory', code: 'NT'},
        ]
    },
    {
        name: 'Nepal',
        code: 'NP',
        states: [
            { name: 'Koshi Province', code: 'KOSHI'},
            { name: 'Madhesh Province', code: 'MADHESH'},
            { name: 'Bagmati Province', code: 'BAGMATI'},
            { name: 'Gandaki Province', code: 'GANDAKI'},
            { name: 'Lumbini Province', code: 'LUMBINI'},
            { name: 'Karnali Province', code: 'KARNALI'},
            { name: 'Sudurpashchim Province', code: 'SUDURPASHCHIM'},
        ]
    },
    // Add more countries here in the future
];
