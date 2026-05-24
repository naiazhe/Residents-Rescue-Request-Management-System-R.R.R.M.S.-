const BASE_URL = 'https://psgc.gitlab.io/api';
const REGION_CODE = '050000000';

async function fetchJSON(url) {
    const response = await fetch(url);
    return await response.json();
}

async function getBarangays(cityCode) {
    return await fetchJSON(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
}

async function getCitiesMunicipalities(provinceCode) {
    return await fetchJSON(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
}

async function getProvinces() {
    return await fetchJSON(`${BASE_URL}/regions/${REGION_CODE}/provinces/`);
}

async function generateBicolDataset() {
    const provinces = await getProvinces();

    const result = {
        region: {
            code: REGION_CODE,
            name: 'Region V (Bicol Region)',
            provinces: []
        }
    };

    for (const province of provinces) {
        console.log(`Processing Province: ${province.name}`);

        const provinceData = {
            code: province.code,
            name: province.name,
            cities_municipalities: []
        };

        const muncities = await getCitiesMunicipalities(province.code);

        for (const muncity of muncities) {
            console.log(`  Processing City/Municipality: ${muncity.name}`);

            const barangays = await getBarangays(muncity.code);

            const muncityData = {
                code: muncity.code,
                name: muncity.name,
                type: muncity.oldName || 'City/Municipality',
                barangays: barangays.map(brgy => ({
                    code: brgy.code,
                    name: brgy.name
                }))
            };

            provinceData.cities_municipalities.push(muncityData);
        }

        result.region.provinces.push(provinceData);
    }

    console.log('\nComplete Bicol Region dataset generated successfully.');
    return result;
}

// Export the data generation function for React Native use
export default generateBicolDataset;