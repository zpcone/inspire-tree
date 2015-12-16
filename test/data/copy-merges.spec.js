'use strict';

describe('Modification', function() {
    var tree1;
    var tree2;

    before(function() {
        helpers.createTreeContainer();
        helpers.createTreeContainer('tree2');

        tree1 = new InspireTree({
            target: '.tree',
            data: [{
                text: 'A',
                id: 1
            }, {
                text: 'B',
                id: 2,
                children: [{
                    text: 'B1',
                    id: 20
                }]
            }]
        });

        tree2 = new InspireTree({
            target: '.tree2',
            data: []
        });
    });

    it('throws error if destination tree isn\'t recognized', function() {
        expect(tree1.getNodes().copy().to).to.throw(Error);
    });

    it('copies all nodes to a new tree', function() {
        expect(tree2.getNodes()).to.have.length(0);

        tree1.getNodes().copy().to(tree2);
        expect(tree2.getNodes()).to.have.length(2);

        tree2.removeAll();
    });

    it('copies given nodes to a new tree', function() {
        expect(tree2.getNodes()).to.have.length(0);

        tree1.getNodes().copy().to(tree2);
        expect(tree2.getNodes()).to.have.length(2);

        tree2.removeAll();
    });

    it('copies selected node to a new tree', function() {
        expect(tree2.getNodes()).to.have.length(0);

        var node = tree1.getNode(1);
        node.select();
        tree1.selected().copy().to(tree2);

        expect(tree2.getNodes()).to.have.length(1);
        expect(tree2.getNodes()[0].id).to.equal('1');

        tree2.removeAll();
    });

    it('copies specific node to a new tree', function() {
        expect(tree2.getNodes()).to.have.length(0);

        var node = tree1.getNode(1);
        node.copy().to(tree2);

        expect(tree2.getNodes()).to.have.length(1);
        expect(tree2.getNodes()[0].id).to.equal('1');

        tree2.removeAll();
    });

    it('copies child node to a new tree', function() {
        expect(tree2.getNodes()).to.have.length(0);

        var node = tree1.getNode(20);
        node.copy().to(tree2);

        expect(tree2.getNodes()).to.have.length(1);
        expect(tree2.getNodes()[0].id).to.equal('20');

        tree2.removeAll();
    });

    it('copies child node and its hierarchy to a new tree', function() {
        expect(tree2.getNodes()).to.have.length(0);

        var node = tree1.getNode(20);
        node.copy(true).to(tree2);

        expect(tree2.getNodes()).to.have.length(1);
        expect(tree2.getNodes()[0].id).to.equal('2');

        tree2.removeAll();
    });

    it('merges new nodes on copy', function() {
        // Move all nodes over
        tree1.getNodes().copy().to(tree2);

        // Check original child count
        expect(tree1.getNode(2).children).to.have.length(1);

        // Push a new child to the copied data
        var parent = tree2.getNode(2);
        parent.addChild({
            text: 'New'
        });

        // Check new child count
        expect(tree2.getNode(2).children).to.have.length(2);

        // Re-copy the node to the original tree
        parent.copy(true).to(tree1);
        expect(tree1.getNode(2).children).to.have.length(2);

        // Ensure children property doesn't exist when it never did
        expect(tree1.getNode(20).children).to.be.undefined;

        tree2.removeAll();
    });

    it('shows child node when merged back into source via api', function() {
        var node = tree1.getNode(20);

        // Remove source copy
        node.softRemove();
        expect(node.removed()).to.be.true;

        // Move it
        node.copy(true).to(tree2);

        // Check new copy
        var clone = tree2.getNode(20);
        expect(clone.removed()).to.be.false;

        // Move back
        clone.copy(true).to(tree1);

        // Check source
        expect(node.removed()).to.be.false;

        tree2.removeAll();
    });

    it('shows child node when merged back into source by selection', function() {
        var node = tree1.getNode(20);

        // Remove source copy
        node.softRemove();
        expect(node.removed()).to.be.true;

        // Move it
        node.copy(true).to(tree2);

        // Check new copy
        var clone = tree2.getNode(20);
        expect(clone.removed()).to.be.false;

        // Re-select in destination
        clone.select();
        var selected = tree2.selected();

        // Move back
        selected.copy(true).to(tree1);

        // Check source
        expect(node.removed()).to.be.false;

        tree2.removeAll();
    });

    it('only shows nodes merged back in', function() {
        // Move all to one tree
        tree1.getNodes().copy().to(tree2);
        tree1.getNodes().softRemove();

        var node = tree2.getNode(20);
        node.copy(true).to(tree1);

        expect(tree1.getNodes()[0].removed()).to.be.true;
        expect(tree1.getNodes()[1].removed()).to.be.false;
        expect(tree1.getNodes()[1].children[0].removed()).to.be.false;
        expect(tree1.getNodes()[1].children[1].removed()).to.be.true;

        tree2.removeAll();
    });

    after(helpers.clearDOM);
});
