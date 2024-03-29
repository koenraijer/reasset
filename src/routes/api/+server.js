import { json } from '@sveltejs/kit'
import { parse } from 'node-html-parser';

export async function GET() {
    const data = await getContributions()
    const funds = transformData(data)
    return json(addIdAndAmount(funds))
}

async function getContributions() {
    const url = "https://marketcaps.site/"
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
    }
    const text = await response.text();
    const root = parse(text);

    let nt = parseTable(root, 'portfolio-nt');
    let msci = parseTable(root, 'portfolio-msci');
    let actiam = parseTable(root, 'portfolio-actiam');

    return { nt, msci, actiam };
}

function parseTable(root, wrapperId) {
    // Usage:
    // parseTable(root, 'portfolio-nt');
    let wrapper = root.querySelector(`#${wrapperId}`);
    if (!wrapper) {
        console.error(`No element with id "${wrapperId}" found`);
        return;
    }

    let table = wrapper.querySelector('table');
    if (!table) {
        console.error(`No "table" element found within "#${wrapperId}"`);
        return;
    }

    let header = Array.from(table.querySelectorAll('tr th')).map(th => th.innerText);
    let rows = Array.from(table.querySelectorAll('tr'));
    let data = [];

    rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip the header row

        let columns = Array.from(row.querySelectorAll('td'));
        if (columns.length > 0) {
            let rowData = {};
            columns.forEach((column, columnIndex) => {
                rowData[header[columnIndex]] = column.innerText;
            });
            data.push(rowData);
        }
    });
    return data;
}

function transformData(data) {
    let funds = {};

    ['nt', 'msci', 'actiam'].forEach(key => {
        funds[key] = {};
        data[key].forEach(fund => {
            ['2 funds', '3 funds', 'No EM'].forEach(type => {
                if (fund[type] && fund[type] !== 'N/A') {
                    let desired_perc = parseFloat(fund[type]);
                    if (!isNaN(desired_perc)) {
                        if (!funds[key][type]) {
                            funds[key][type] = [];
                        }
                        funds[key][type].push({
                            name: fund.Fund || fund.Index,
                            desired_perc: desired_perc
                        });
                    }
                }
            });
        });
    });

    return funds;
}

function addIdAndAmount(data) {
    ['nt', 'msci', 'actiam'].forEach(key => {
        ['2 funds', '3 funds', 'No EM'].forEach(type => {
            if (data[key] && data[key][type]) {
                data[key][type] = data[key][type].map((fund, index) => ({
                    id: index + 1,
                    amount: 0,
                    ...fund
                }));
            }
        });
    });
    return data;
}