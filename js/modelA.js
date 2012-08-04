/**var User = Backbone.Model.extend({
	initializes: function(name) {
		this.set({name: name});
	}
});

var user = new User("matsuno");
assertEqual(user.get("name"), "matsuno");

var Users = Backbone.Collection.extend({
	model: User
});

var users = new Users([{name: "matsuno"}, {name: "hogehoge"}]);
*/

jQuery(function($) {

window.Todo = Backbone.Model.extend({
	defaults: {
		done: false
	},
	toggle: function() {
		this.save({done: !this.get("done")});
	},
	    // Remove this Todo from *localStorage* and delete its view.
    clear: function() {
      this.destroy();
    }
});

window.TodoList = Backbone.Collection.extend({
	model: Todo,

	localStorage: new Store("hh"),

	done: function() {
		return this.filter(function(todo) {
			return todo.get("done");
		});
	},

	remaining: function() {
		return this.without.apply(this, this.done());
	}

});

window.Todos = new TodoList;

window.TodoView = Backbone.View.extend({

	tagName: "li",

	template: $("#item-template").template(),

	events: {
		"change .check" : "toggleDone",
		"dblclick .todo-content" : "edit",
		"click .todo-destroy" : "destroy",
		"keypress .todo-input" : "updateOnEnter",
		"blur .edit" : "close"
	}, 

	initialize: function() {
		_.bindAll(this, 'render', 'close', 'remove');
		
		this.model.bind('change', this.render);
		this.model.bind('destroy', this.remove);
	},

	render: function() {
		var element = jQuery.tmpl(this.template, this.model.toJSON());
		$(this.el).html(element);
		console.log('render');
		console.log('remaining item count : ' + Todos.length);
		//this.$("#clear-completed").append(Todos.remaining());
		return this;
	},

	toggleDone: function() {
		this.model.toggle();
	},

	edit: function() {
		console.log('edit');
		$(this.el).addClass("editing");
		console.log(this);
		this.$(".todo-input").focus();
	},

	close: function(e) {
		console.log(e);
		console.log(this);
		this.model.save({content: this.$(".todo-input").val()});
		$(this.el).removeClass("editing");
	},

	updateOnEnter: function(e) {
		console.log(e);
		if (e.keyCode == 13) e.target.blur();
	},

	remove: function() {
		console.log('remove');
		$(this.el).remove();
	},

	destroy: function() {
		console.log('destroy');
		this.model.destroy();
	}
});

window.AppView = Backbone.View.extend({
	el: $("#todoapp"),

   // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

	events: {
		"keypress #new-todo": "createOnEnter",
		"click #clear-completed": "clearOnCompleted",
        "click #toggle-all": "toggleAllComplete"

	},

	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll', 'render');

		this.input = this.$("#new-todo");

      this.allCheckbox = this.$("#toggle-all")[0];

		Todos.bind('add', this.addOne);
		Todos.bind('reset', this.addAll);

        Todos.bind('all', this.render, this);

      	this.footer = this.$('footer');
      	this.main = $('#todos');
		
		Todos.fetch();
	},

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
    	console.log('render in app');
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

        this.main.show();
        this.footer.show();

        console.log(this.footer);
        console.log(this.statsTemplate({done: done, remaining: remaining}));
   		this.footer.html(this.statsTemplate({done: done, remaining: remaining}));

      this.allCheckbox.checked = !remaining;
    },

	addOne: function(todo) {
		var view = new TodoView({model:todo});
		this.$("#todo-list").append(view.render().el);
	},

	addAll: function() {
		Todos.each(this.addOne);
	},

	createOnEnter: function(e) {
		if (e.keyCode != 13) return;
		var value = this.input.val();
		if (!value) return;
		Todos.create({content: value});
		this.input.val('');
	},

	clearOnCompleted: function() {
		console.log('claerOnCompleted')
		_.each(Todos.done(), function(todo) {
			//alert("destroy");
			todo.destroy();
		});
		return false;
	},

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    }	
});

window.App = new AppView;
});