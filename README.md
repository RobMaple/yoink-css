

# Yoink
Yoink allows you to take a CSS-in-JS approach to writing CSS inside template files of other languages and non-js specific projects. 

## Features

- Co-locate CSS code with the template markup it corresponds to.
- Scope classes to the markup in that file.
- Write SCSS, LESS or any other CSS preprocessor syntax.
- Extracts CSS to a single file that can then be used as part of your usual build process.
- Can be used with both Gulp and NPM scripts / CLI.

## Caveats

- This project is currently a work in progress and whilst currently used in production projects, it has only been tested in a limited amount of template languages / project setups.
- Writing CSS in template files is not going to be ideal for all projects and is defiantly more suited to codebases where template are made up of small partials, much in the same way React or Vue projects are.
- It may take a bit of configuration in your text editor to provide proper syntax highlighting when writing CSS in template files.

## Installation

``` 
npm install yoink-css
```

## Usage

Yoink removes any internal CSS from templates that have the attribute 'extract'.

```css
<style extract>
    /*...Your CSS here...*/
</style>
```

Additionally, Yoink will scope any class selector that starts with a particular prefix to the markup in that file. The default prefix is '--' although this can be changed in the configuration.

```css 
.--your_class {
     /*...Your CSS here...*/
}

// Becomes...

.134567_your_class {
     /*...Your CSS here...*/
}
```

Regular class names and scoped class names can be mix and matched.

```css 
.normal_class .--scoped_class  {
     /*...Your CSS here...*/
}

```

## Configuration

If you're using Gulp, Yoink accepts a configuration object with these keys:

`css_dest` - *Required* The complete destination path of the merged CSS file (including file name).

`Prefix` - *Defualt: '--'* The class selector prefix that will be replaced to scope a class to it's file.

---

Using NPM scripts / CLI, an additional 2 args are required:

`src` - *Required* The src template folder that gets watched

`dest` - *Required*  The destination folder where the processed templates should go. 


**NOTE:** *Currently Yoink requires that both the src and dest folders are NOT your root directory*

---

These args can be passed to Yoink CLI version either using these flags:

`--src`

`--dest`

`--css_dest`

`--prefix`

---

Or alternatively, Yoink will look for a configuration file in your working directory called 'yoink.config.js' that should contain a config object like this:

```javascript
module.exports = {
    src : './templates/',
    dest: './dist/',
    css_dest: './scss/styles.scss',
    prefix : '--'
}
```

## Examples

As part of a Gulpfile, Yoink will look something like this:

```javascript
function extract_css() {
    return gulp
        .src(["./templates/**/*"])
        .pipe(yoink({
            css_dest: '.scss/style.scss',
            prefix : '--'
        }))
        .pipe(gulp.dest("./dist/templates/"));
}
```

Using NPM scripts...

```javascript
// ...
"scripts": {
      "start": "yoink --src ./src/templates --dest ./dist/"
},
// ...
```

The examples folder contains a simple working example of both Gulp / NPM srcips usage.
