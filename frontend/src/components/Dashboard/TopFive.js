import { Fragment } from "react"

const DATASET = [
    {
        id: 1,
        name: "AAA",
        value: 12,
        change: -2
    },
    {
        id: 2,
        name: "BBB",
        value: 8,
        change: 20
    },
    {
        id: 3,
        name: "CCC",
        value: 2,
        change: 7
    },
    {
        id: 4,
        name: "DDD",
        value: 100,
        change: -10
    },
    {
        id: 5,
        name: "EEE",
        value: 58,
        change: 5
    }
]


const TopFive = () => {
    return (
        //new Fragment tag syntax <> and </>
        <> 
            <p>Top 1</p>
            Company:{DATASET[0].name} Price:${DATASET[0].value} Change:{DATASET[0].change}%
            <p>Top 2</p>
            Company:{DATASET[1].name} Price:${DATASET[1].value} Change:{DATASET[1].change}%
            <p>Top 3</p>
            Company:{DATASET[2].name} Price:${DATASET[2].value} Change:{DATASET[2].change}%
            <p>Top 4</p>
            Company:{DATASET[3].name} Price:${DATASET[3].value} Change:{DATASET[3].change}%
            <p>Top 5</p>
            Company:{DATASET[4].name} Price:${DATASET[4].value} Change:{DATASET[4].change}%
        </>
    )
}

export default TopFive;