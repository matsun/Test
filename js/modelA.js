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
	}
});

window.TodoList = Backbone.Collection.extend({
	model: Todo,

	localStorage: new Store("todos"),

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
		"keypress .todo-input" : "updateOnEnter",
		"blur .todo-input" : "close"
	}, 

	initialize: function() {
		_.bindAll(this, 'render', 'close');
		this.model.bind('change', this.render);
	},

	render: function() {
		var element = jQuery.tmpl(this.template, this.model.toJSON());
		$(this.el).html(element);
		return this;
	},

	toggleDone: function() {
		this.model.toggle();
	},

	edit: function() {
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
	}
});

window.AppView = Backbone.View.extend({
	el: $("#todoapp"),

	events: {
		"keypress #new-todo": "createOnEnter",
		"click .todo-clear a": "clearOnCompleted"
	},

	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll', 'render');

		this.input = this.$("#new-todo");

		Todos.bind('add', this.addOne);
		Todos.bind('refresh', this.addAll);

		Todos.fetch();
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
		_.each(Todos.done(), function(todo) {
			alert("destroy");
		});
		return false;
	}
});

window.App = new AppView;
});