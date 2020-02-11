import { EmbeddedType } from '../data/EmbeddedType';

interface IEmbeddedViewBindings {
    [key: string]: any;

    embed_type: any;
    embed_uri: any;
}

const EmbeddedViewBindings: IEmbeddedViewBindings = {
    embed_type: '=?pipEmbeddedType',
    embed_uri: '=?pipEmbeddedUri',
}

class EmbeddedViewChanges implements ng.IOnChangesObject, IEmbeddedViewBindings {
    [key: string]: ng.IChangesObject<any>;

    embed_type: ng.IChangesObject<string>;
    embed_uri: ng.IChangesObject<string>;
}

class EmbeddedViewController implements ng.IController {
    public $onInit() { }
    public embed_type: string;
    public embed_uri: string;

    constructor(
        private $element: JQuery,
        public pipMedia: pip.layouts.IMediaService
    ) {
        $element.addClass('pip-embedded-view');

        this.init();
    }

    public $onChanges(changes: EmbeddedViewChanges): void {
        console.log('$onChanges');
        this.init();
    }

    private init(): void {

    }

}

(() => {

    function declaredEmbeddedViewResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {

        });
        pipTranslateProvider.translations('ru', {

        });
    }

    function resourceYoutubeConfig($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'https://www.youtube.com/**'
        ]);
    }

    angular
        .module('pipEmbeddedView', [])
        .component('pipEmbeddedView', {
            bindings: EmbeddedViewBindings,
            templateUrl: 'embedded_view/EmbeddedView.html',
            controller: EmbeddedViewController,
            controllerAs: '$ctrl'
        })
        .config(resourceYoutubeConfig)
        .config(declaredEmbeddedViewResources);
})();
