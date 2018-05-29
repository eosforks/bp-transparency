# EOS Block Producer Transparency & Accountability Dashboard

We introduce the Block Producer Transparency and Accountability Dashboard, a tool we are developing to allow us at EOS SOCAL, a proud block producer candidate, to offer full transparency and accountability to EOS token holders as it relates to our use and allocation of block production token rewards. This dashboard will be publicly available and accessible on our website for anyone to view and audit in real time.

Further we offer to make this tool available, open source, to any block producer who wishes to utilize and customize this tool to their own structure, to similarly offer transparency and accountability. We also invite others to help further develop and improve its functionality through a collaboration on GitHub.

## Functionality and Features Under Development

This tool is designed to tag EOS token transactions with parameters to allow otherwise unidentifiable transactions to be organized into charts, financial reports and more. This allows block producers to provide as much level of transparency as they'd like to token holders and make block producers accountable for campaign promises in such areas as commitments to community benefit.

With this dashboard, anyone will be able to view in real time:

1.  Charts that allow quick visualization of the "waterfall" of rewards usage, expenditures and allocation of net earnings.

2.  Financial statements such as token based "Profit & Loss" for a given period.

3.  Auditable detailed transaction ledger reconciled to the original account wallet that received token rewards.

4.  Customizable reports.

## How It Works

This tool utilizes the `memo` area available in EOS token transactions to allow block producers to specify the purpose of each token transfer by adding highly-customizable parameters that can be used to organize and categorize transactions for the purpose of reporting financial and organizational expenditures and token allocations.

Each entry on the memo area of a transaction should be structured as a valid JSON object. Samples of such memos include:

```

{"type": "expense", "class": "technical", "category": "server", "account": "hardware upgrades", "detail": "replacing power supply"}

{"type": "expense", "class": "administrative", "category": "personnel", "account": "administrator", "detail": "bi-weekly salary for john doe"}

{"type": "expense", "class": "community benefit", "subclass": "meetups", "category": "G & A", "account": "rent", "detail": "Hotel conference hall venue on march 20, 2018"}

```

A full transfer done using `cleos` would be as follows:

```

Cleos transfer eosocal account.1 62123 '{"type": "expense", "class": "community benefit", "subclass": "meetups", "category": "G & A", "account": "rent", "detail": "Hotel conference hall venue on march 20, 2018"}'

```

It is important to note that the keys and values of the parameters can be fully customized by each BP so nobody is forced to change their workflow in order to accommodate this transparency initiative.

## Open Source Collaboration and Future Possibilities

We invite all block producers use this tool and all passionate contributors to help further develop it as a community benefit. Through a collaborative effort, we hope this tool will evolve into a feature-rich tool that could serve in the future to establish a standard level of expected transparency and accountability of all block producers.

EOS SOCAL is in process of developing this this tool for its own use, however, our hope is that the community will continue to further build and improve, for the benefit of the community at large.

Current Stack

-   Frontend: Vue.js, specifically Nuxt.js

-   Blockchain Connection: eosjs

-   Style: Sass

Immediate Roadmap

-   Refactor code -- initial commit is a "Just Make it Work" iteration and needs cleaning

-   Modularize implementation so any BP can quickly make the transparency dashboard accommodate their own unique workflow and bookkeeping

-   Make the dashboard look and feel more useful

-   Create an easy-to-use form consisting of dropdowns and inputs so that a BP making manual transactions can easily generate a valid JSON-ready memo

Possible Future Features

-   Save fetched data to a local database for quicker processing

-   Use historical token value data to translate to fiat values

-   Date range based reports

-   Exportable into Quickbooks or other accounting software

-   Advanced financial statements such as Balance Sheets

-   What else?

Please join us on in our Telegram channel for discussions around this project: <https://t.me/eossocal>

## Setting up development environment

Clone the repository via this link: https://github.com/EOSoCal/bp-transparency.git

-   Open the terminal and run "npm install" to install all the dependencies

    If you don't have npm, download and install node.js and npm via this link: https://nodejs.org/en/download/

-   Configure env variables

    head to `nuxt.config.js` and update the following with your blockchain's endpoint and the account you're interested in:

```
env: {
    blockchainEndpoint: '<URL>',
    eosAccountName: '<ACCOUNT>',
    rowsPerPage: '<The number of rows per page for dataTable>',
    charts: [
      {
        type: '<Chart Type>', // bar, pie, doughnut, etc...
        groupBy: ['<Any of transaction data columns>'],
        filters: { // Filters the transaction data by parameters
          type: 'expense', // Parameters are not bound, can be any of transaction data columns
          subclass: null,  // Value needs to be 'null' in case you need specific column to be empty
          operation: 'AND' or 'OR' // Do 'AND' or 'OR' operation for parameters
        },
        showUndefined: true // Check whether chart shows "undefined" data or not.
      }
    ]
},
```
