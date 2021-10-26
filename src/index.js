import ForceGraph from './force-graph'
import * as d3 from 'd3'

d3.csv('./data_filtered.csv').then((data) => {
    console.log('data json', data);
    const groupedData = d3.groups(data, d => d.cluster)
    const clusterCenterNodes = groupedData.map(group => {
        const labels = {}
        group[1].forEach(node => {
            const ls = JSON.parse(node.labels.replace(/\['(.*?)',/g, '["$1",'))
            ls.forEach(label => {
                if (labels[label[0]]) {
                    labels[label[0]].count += label[1]
                } else {
                    labels[label[0]] = {
                        name: label[0],
                        count: label[1]
                    }
                }
            })
        })
        const sortedLabels = d3.sort(Object.values(labels), (a,b) => d3.descending(a.count, b.count))
        return {
            id: `cluster-${group[0]}`,
            group: 'cluser-center',
            count: group[1].length,
            labels: sortedLabels.slice(0,5)
        }
    })
    const dataEntriesNodes = data.map((d, i) => {
        return {
            ...d,
            id: `node-${i}`,
            group: 'node'
        }
    })
    const dataLinks = data.map((d, i) => {
        return {
            source: `node-${i}`,
            target: `cluster-${d.cluster}`
        }
    })
    const graph = {
        nodes: [
            ...clusterCenterNodes,
            ...dataEntriesNodes
        ],
        links: [...dataLinks]
    }
    console.log('graph.nodes', graph.nodes);
    
    const chart = ForceGraph(graph, {
        nodeId: d => d.id,
        nodeGroup: d => d.group,
        nodeTitle: d => d.labels ? `${d.labels}` : `${d.id}`,
        width: 1000,
        height: 800,
        // nodeStrength: -3
    })
    document.querySelector('.viz-2').append(chart)

    const extent = d3.extent(clusterCenterNodes, n => n.count)

    const radiusScale = d3.scaleSqrt(extent, [5, 25])
    const maxNodesPerCluster = 20
    const dataEntriesNodes2 = groupedData.reduce((acc, cur) => {
        const nodes = cur[1].slice(0, maxNodesPerCluster).map((d, i) => {
            return {
                ...d,
                group: 'node'
            }
        })
        return [
            ...acc,
            ...nodes
        ]
    }, [])
    const dataLinks2 = dataEntriesNodes2.map((d, i) => {
        return {
            source: d.id,
            target: `cluster-${d.cluster}`
        }
    })
    const graph2 = {
        nodes: [
            ...clusterCenterNodes,
            ...dataEntriesNodes2
        ],
        links: [...dataLinks2]
    }
    
    const chart2 = ForceGraph(graph2, {
        nodeId: d => d.id,
        nodeGroup: d => d.group,
        nodeTitle: d => d.labels ? `${d.labels}` : `${d.id}`,
        width: 1000,
        height: 800,
        nodeRadius: 8,
        radiusScale
    })
    document.querySelector('.viz-3').append(chart2)

})

