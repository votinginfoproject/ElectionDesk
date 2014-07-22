<?php namespace Consumer\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class WorkCommand extends Command {

    protected function configure()
    {
        $this
            ->setName('work')
            ->setDescription('Starts a single consumer')
            ->addArgument(
                'consumer',
                InputArgument::REQUIRED,
                'twitter|facebook|google|datasift|gnip'
            )
            ->addArgument(
                'filter',
                InputArgument::OPTIONAL,
                'id (or endpoint name for a Gnip worker)'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
    	$consumer = \Consumer\Consumer::resolve($input->getArgument('consumer'));

        $consumerName = get_class($consumer);

        if ($consumer instanceof \Consumer\IndividualConsumer\IndividualConsumer) {
            $filter = \Consumer\Model\Filter::find($input->getArgument('filter'));
            $output->writeln('Consuming "'. $consumerName .'" with filter "'. $filter->title .'"');

            $consumer->consume($filter);
        } elseif ($consumer instanceof \Consumer\GnipConsumer) {
            $endpoint = $input->getArgument('filter');

            $output->writeln('Consuming "'. $consumerName .'" (' . $endpoint . ')');
            $consumer->setEndpoint($endpoint);
            $consumer->consume(\Consumer\Model\Filter::where('active', 1)->get());
        } else {
            $output->writeln('Consuming "'. $consumerName .'"');
            $consumer->consume(\Consumer\Model\Filter::where('active', 1)->get());
        }
    }

}